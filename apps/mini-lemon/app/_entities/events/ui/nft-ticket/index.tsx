"use client";

import type * as THREE from "three";
import { useRef, useState } from "react";
import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";

export type TicketStyle = "silver" | "gold" | "copper";

interface NFTTicketProps {
  // Event details
  eventName?: string;
  eventImageUrl?: string;
  startDate?: Date;
  ticketName?: string;
  location?: string;
  locationDetails?: string;

  // Ticket holder details
  ticketHolderName?: string;
  ticketHolderUsername?: string;
  ticketHolderAvatar?: string;

  // Organizer details
  organizerName?: string;
  organizerEmail?: string;
  organizerAvatar?: string;

  // Blockchain details
  tokenId?: string;
  qrCodeData?: string;

  // Style variant
  style?: TicketStyle;
}

const getStyleConfig = (style: TicketStyle) => {
  switch (style) {
    case "gold":
      return {
        background: `
          linear-gradient(135deg, #fef3c7 0%, #fbbf24 25%, #f59e0b 50%, #d97706 75%, #92400e 100%),
          linear-gradient(45deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 50%, rgba(0,0,0,0.1) 100%)
        `,
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.9),
          inset 0 -1px 0 rgba(0,0,0,0.1),
          inset 1px 0 0 rgba(255,255,255,0.5),
          inset -1px 0 0 rgba(0,0,0,0.1)
        `,
        shimmer:
          "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
        textColor: "#7c2d12",
        labelColor: "#92400e",
        secondaryColor: "#78350f",
        dashedBorder: "#92400e",
        middleFaces: ["#d97706", "#f59e0b", "#fbbf24"],
      };
    case "copper":
      return {
        background: `
          linear-gradient(135deg, #fed7aa 0%, #fb923c 25%, #ea580c 50%, #c2410c 75%, #9a3412 100%),
          linear-gradient(45deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 50%, rgba(0,0,0,0.1) 100%)
        `,
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.9),
          inset 0 -1px 0 rgba(0,0,0,0.1),
          inset 1px 0 0 rgba(255,255,255,0.5),
          inset -1px 0 0 rgba(0,0,0,0.1)
        `,
        shimmer:
          "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
        textColor: "#7c2d12",
        labelColor: "#9a3412",
        secondaryColor: "#c2410c",
        dashedBorder: "#9a3412",
        middleFaces: ["#ea580c", "fb923c", "#fed7aa"],
      };
    default: // silver
      return {
        background: `
          linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #94a3b8 75%, #64748b 100%),
          linear-gradient(45deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 50%, rgba(0,0,0,0.1) 100%)
        `,
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.9),
          inset 0 -1px 0 rgba(0,0,0,0.1),
          inset 1px 0 0 rgba(255,255,255,0.5),
          inset -1px 0 0 rgba(0,0,0,0.1)
        `,
        shimmer:
          "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
        textColor: "#111827",
        labelColor: "#4b5563",
        secondaryColor: "#374151",
        dashedBorder: "#6b7280",
        middleFaces: ["#6b7280", "#6b7280", "#9ca3af"],
      };
  }
};

function TicketMesh({
  eventName = "Sample Event",
  eventImageUrl = "/images/event-image-example-02.jpg",
  startDate = new Date(),
  ticketName = "General Admission",
  location = "Virtual Event",
  locationDetails = "Online Platform",
  ticketHolderName = "John Doe",
  ticketHolderUsername = "@johndoe",
  ticketHolderAvatar,
  organizerName = "Event Organizers",
  organizerEmail = "contact@eventorganizers.com",
  organizerAvatar,
  tokenId = "#EVT001",
  qrCodeData,
  style = "silver",
}: NFTTicketProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [flipped, setFlipped] = useState(false);

  const styleConfig = getStyleConfig(style);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString();
    const month = date
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    const weekday = date
      .toLocaleDateString("en-US", { weekday: "short" })
      .toUpperCase();
    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const [timeStr, period] = time.split(" ");
    const timezone =
      Intl.DateTimeFormat()
        .resolvedOptions()
        .timeZone.split("/")[1]
        ?.toUpperCase() || "UTC";

    return { day, month, weekday, timeStr, period, timezone };
  };

  const { day, month, weekday, timeStr, period, timezone } =
    formatDate(startDate);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const qrUrl =
    qrCodeData ??
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      `NFT-TICKET:${tokenId}:${eventName}:${startDate.toISOString()}`,
    )}`;

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

      // Smooth flip animation using lerp
      const targetRotation = flipped ? Math.PI : 0;
      meshRef.current.rotation.y +=
        (targetRotation - meshRef.current.rotation.y) * 0.1;
    }
  });

  const handleClick = () => {
    setFlipped(!flipped);
  };

  return (
    <group ref={meshRef} onClick={handleClick}>
      {/* Front Face */}
      <Html
        transform
        occlude="blending"
        position={[0, 0, 0.02]}
        style={{
          width: "280px",
          height: "550px",
          pointerEvents: "none",
          fontSize: "14px",
          fontSmooth: "always",
          WebkitFontSmoothing: "antialiased",
          textRendering: "optimizeLegibility",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "16px",
            color: styleConfig.textColor,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: styleConfig.background,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "0",
              borderRadius: "16px",
              background: styleConfig.shimmer,
              animation: "shimmer 3s ease-in-out",
            }}
          />

          {/* Event Image - Top half, 1:1 aspect ratio */}
          <div
            style={{
              padding: "12px",
              paddingBottom: "4px",
              position: "relative",
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#1f2937",
                marginBottom: "8px",
                boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
              }}
            >
              <img
                src={eventImageUrl || "/placeholder.svg"}
                alt="Event"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          <div
            style={{
              margin: "0 12px",
              marginTop: "4px",
              marginBottom: "4px",
              position: "relative",
              zIndex: 10,
            }}
          >
            <div
              style={{
                borderTop: "2px dashed",
                borderColor: styleConfig.dashedBorder,
                opacity: 0.6,
                position: "relative",
              }}
            />

            {/* Left circular cut-out */}
            <div
              style={{
                position: "absolute",
                left: "-20px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "16px",
                height: "16px",
                backgroundColor: "var(--color2)",
                borderRadius: "50%",
                zIndex: 20,
              }}
            />

            {/* Right circular cut-out */}
            <div
              style={{
                position: "absolute",
                right: "-20px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "16px",
                height: "16px",
                backgroundColor: "var(--color2)",
                borderRadius: "50%",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                zIndex: 20,
              }}
            />
          </div>

          <div
            style={{
              padding: "12px 12px",
              paddingBottom: "8px",
              position: "relative",
              zIndex: 10,
            }}
          >
            <h1
              style={{
                fontSize: "18px",
                fontWeight: "900",
                textAlign: "center",
                marginBottom: "8px",
                lineHeight: "1.25",
                color: styleConfig.textColor,
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                letterSpacing: "0.025em",
                textTransform: "uppercase",
              }}
            >
              {eventName}
            </h1>
          </div>

          <div
            style={{
              padding: "0 12px",
              paddingBottom: "12px",
              gap: "16px",
              flex: 1,
              position: "relative",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Date and Time Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    color: styleConfig.labelColor,
                    fontWeight: "500",
                    marginBottom: "2px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  DATE
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "900",
                      color: styleConfig.textColor,
                      lineHeight: "1",
                    }}
                  >
                    {day}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: "1",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: styleConfig.textColor,
                      }}
                    >
                      {month}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: styleConfig.secondaryColor,
                      }}
                    >
                      {weekday}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    color: styleConfig.labelColor,
                    fontWeight: "500",
                    marginBottom: "2px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  TIME
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "900",
                      color: styleConfig.textColor,
                      lineHeight: "1",
                    }}
                  >
                    {timeStr}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: "1",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: styleConfig.textColor,
                      }}
                    >
                      {period}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: styleConfig.secondaryColor,
                      }}
                    >
                      {timezone}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    color: styleConfig.labelColor,
                    fontWeight: "500",
                    marginBottom: "2px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  TICKET
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: styleConfig.textColor,
                  }}
                >
                  {ticketName}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    color: styleConfig.labelColor,
                    fontWeight: "500",
                    marginBottom: "2px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  VENUE
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: styleConfig.textColor,
                  }}
                >
                  {location}
                </div>
                {/* {locationDetails && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: styleConfig.secondaryColor,
                    }}
                  >
                    {locationDetails}
                  </div>
                )} */}
              </div>
            </div>

            <div
              style={{
                paddingTop: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  color: styleConfig.labelColor,
                  fontWeight: "500",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                TICKET HOLDER
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    background:
                      "linear-gradient(to bottom right, #60a5fa, #a855f7)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {ticketHolderAvatar ? (
                    <img
                      src={ticketHolderAvatar || "/placeholder.svg"}
                      alt="Avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "700",
                      }}
                    >
                      {getInitials(ticketHolderName)}
                    </span>
                  )}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: styleConfig.textColor,
                    }}
                  >
                    {ticketHolderUsername}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: styleConfig.secondaryColor,
                    }}
                  >
                    Verified Owner
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Html>

      {/* Back Face */}
      <Html
        transform
        occlude="blending"
        position={[0, 0, -0.02]}
        rotation={[0, Math.PI, 0]}
        style={{
          width: "280px",
          height: "550px",
          pointerEvents: "none",
          fontSize: "14px",
          fontSmooth: "always",
          WebkitFontSmoothing: "antialiased",
          textRendering: "optimizeLegibility",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "16px",
            color: styleConfig.textColor,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: styleConfig.background,
            boxShadow: styleConfig.boxShadow,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "0",
              borderRadius: "16px",
              background: styleConfig.shimmer,
              animation: "shimmer 3s ease-in-out",
            }}
          />

          <div
            style={{
              padding: "12px",
              paddingBottom: "4px",
              position: "relative",
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "white",
                marginBottom: "8px",
                boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
                border: "1px solid #d1d5db",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={qrUrl || "/placeholder.svg"}
                alt="QR Code for ticket verification"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: "16px",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          <div
            style={{
              margin: "0 12px",
              marginTop: "4px",
              marginBottom: "4px",
              position: "relative",
              zIndex: 10,
            }}
          >
            <div
              style={{
                borderTop: "2px dashed",
                borderColor: styleConfig.dashedBorder,
                opacity: 0.6,
                position: "relative",
              }}
            />

            {/* Left circular cut-out */}
            <div
              style={{
                position: "absolute",
                left: "-20px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "16px",
                height: "16px",
                backgroundColor: "var(--color2)",
                borderRadius: "50%",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                zIndex: 20,
              }}
            />

            {/* Right circular cut-out */}
            <div
              style={{
                position: "absolute",
                right: "-20px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "16px",
                height: "16px",
                backgroundColor: "var(--color2)",
                borderRadius: "50%",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                zIndex: 20,
              }}
            />
          </div>

          <div
            style={{
              padding: "0 12px",
              paddingBottom: "12px",
              flex: 1,
              position: "relative",
              zIndex: 10,
            }}
          >
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {/* Verification Section */}
              {tokenId !== "" ? (
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: styleConfig.labelColor,
                      fontWeight: "500",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    VERIFICATION
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: styleConfig.textColor,
                      marginBottom: "4px",
                    }}
                  >
                    BLOCKCHAIN CERTIFIED
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: styleConfig.secondaryColor,
                    }}
                  >
                    Token ID: {tokenId}
                  </div>
                </div>
              ) : (
                <div style={{ height: "10px" }} />
              )}

              {/* Event Organizer */}
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    color: styleConfig.labelColor,
                    fontWeight: "500",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  ORGANIZER
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  {organizerAvatar && (
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={organizerAvatar || "/placeholder.svg"}
                        alt="Organizer"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: styleConfig.textColor,
                    }}
                  >
                    {organizerName}
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    color: styleConfig.labelColor,
                    fontWeight: "500",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  TERMS
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: styleConfig.secondaryColor,
                    lineHeight: "1.625",
                    gap: "4px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <p>• Non-transferable without blockchain verification</p>
                  <p>• Valid for single use only</p>
                  <p>• Subject to event terms & conditions</p>
                  <p>• Refunds available up to 24hrs before event</p>
                </div>
              </div>

              {/* Footer */}
              {/* <div
                style={{
                  paddingTop: '8px',
                  borderTop: '1px dashed',
                  borderColor: styleConfig.dashedBorder,
                }}
              >
                <div
                  style={{
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      color: styleConfig.labelColor,
                      fontWeight: '500',
                    }}
                  >
                    POWERED BY NFT TECHNOLOGY
                  </div>
                  <div
                    style={{
                      fontSize: '8px',
                      color: styleConfig.secondaryColor,
                      marginTop: '2px',
                    }}
                  >
                    Secure • Authentic • Verifiable
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

export default function NFTTicket(props: NFTTicketProps) {
  return (
    <div className="bg-background h-full w-full">
      <Canvas camera={{ position: [0, 0, 25], fov: 40 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} />
        <TicketMesh {...props} />
        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={12}
          maxDistance={35}
          autoRotate={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
