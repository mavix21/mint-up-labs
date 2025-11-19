import { createFormHook } from "@tanstack/react-form";

import { fieldContext, formContext } from "./context";

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {},
  formComponents: {},
  fieldContext,
  formContext,
});
