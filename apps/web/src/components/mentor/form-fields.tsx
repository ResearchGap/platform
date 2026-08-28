import { Field, FieldDescription, FieldLabel } from "@platform/ui/components/field";
import { Input } from "@platform/ui/components/input";
import { Textarea } from "@platform/ui/components/textarea";

export function MentorInput({
  description,
  label,
  ...props
}: React.ComponentProps<typeof Input> & { description?: string; label: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={props.id}>{label}</FieldLabel>
      <Input {...props} />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </Field>
  );
}

export function MentorTextarea({
  description,
  label,
  ...props
}: React.ComponentProps<typeof Textarea> & { description?: string; label: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={props.id}>{label}</FieldLabel>
      <Textarea {...props} />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </Field>
  );
}

export function optionalValue(data: FormData, name: string): string | null {
  const value = String(data.get(name) ?? "").trim();
  return value || null;
}

export function requiredValue(data: FormData, name: string): string {
  return String(data.get(name) ?? "").trim();
}

export function toDateTimeLocal(value: string): string {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function toIso(value: string): string {
  return new Date(value).toISOString();
}
