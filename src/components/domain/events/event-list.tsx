import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  SidebarGroup,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useCreateEvent } from "@/hooks/use-create-event";
import { useProximityEvents } from "@/hooks/use-proximity-events";
import { qc } from "@/lib/query";
import { create_event_schema } from "@api/schemas/events";
import { useForm } from "@tanstack/react-form";
import { Calendar1, CalendarPlusIcon, CalendarXIcon } from "lucide-react";
import { useState, type FC } from "react";
import { toast } from "sonner";

const EventList: FC = () => {
  const { data, isError, isLoading } = useProximityEvents();

  const { mutateAsync: create } = useCreateEvent();

  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      location: "",
      start_at: Date.now(),
    },
    validators: {
      onSubmit: create_event_schema as never,
    },
    onSubmit: async ({ value }) => {
      await create(value, {
        onSuccess: () => {
          toast.success("Événement créé avec succès !");
          setOpen(false);
          form.reset();

          qc.invalidateQueries({ queryKey: ["proximity-events"] });
        },
        onError: () => {
          toast.error("Erreur lors de la création de l'événement.");
        },
      });
    },
  });

  return (
    <>
      <SidebarGroup>
        <SidebarMenuItem>
          <SidebarMenuButton className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <Calendar1 className="size-4" />
              Événements à proximité
            </div>
          </SidebarMenuButton>

          <SidebarMenuSub>
            {isError ? (
              <SidebarMenuSubItem>
                <p>Erreur lors du chargement des événements.</p>
              </SidebarMenuSubItem>
            ) : null}

            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <SidebarMenuSubItem key={`event-loading-${i}`}>
                    <SidebarMenuSkeleton />
                  </SidebarMenuSubItem>
                ))
              : null}

            {data && data.length > 0 ? (
              data.map((entry) => {
                return (
                  <SidebarMenuSubItem
                    className="flex items-center gap-2"
                    key={entry.id}
                  >
                    <p>{entry.name}</p>
                    <SidebarMenuBadge>
                      {new Date(entry.start_at).toLocaleDateString()}
                    </SidebarMenuBadge>
                  </SidebarMenuSubItem>
                );
              })
            ) : (
              <SidebarMenuSubItem className="flex items-center gap-2">
                <CalendarXIcon className="size-4" />
                Aucun événement à proximité.
              </SidebarMenuSubItem>
            )}
          </SidebarMenuSub>
        </SidebarMenuItem>

        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <SidebarMenuItem>
              <SidebarMenuButton className="flex items-center gap-2 mt-2">
                <CalendarPlusIcon className="size-4" />
                Créer un événement
              </SidebarMenuButton>
            </SidebarMenuItem>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="flex flex-col p-2 mx-2">
              <form
                id="create-event"
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
              >
                <FieldGroup>
                  <form.Field
                    name="name"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Nom de l'événement
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="Nom de l'événement"
                          />

                          {isInvalid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      );
                    }}
                  />

                  <form.Field
                    name="description"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Description
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="Description de l'événement"
                          />

                          {isInvalid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      );
                    }}
                  />

                  <form.Field
                    name="location"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Adresse de l'événement
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="Adresse de l'événement"
                          />

                          {isInvalid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      );
                    }}
                  />

                  <form.Field
                    name="start_at"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Date de début de l'événement
                          </FieldLabel>
                          <Input
                            type="datetime-local"
                            id={field.name}
                            name={field.name}
                            value={new Date(field.state.value)
                              .toISOString()
                              .slice(0, 16)}
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              field.handleChange(
                                new Date(e.target.value).getTime(),
                              )
                            }
                            aria-invalid={isInvalid}
                            placeholder="Date de début de l'événement"
                          />

                          {isInvalid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      );
                    }}
                  />
                </FieldGroup>

                <Button type="submit" className="mt-4 w-full">
                  Créer l'événement
                </Button>
              </form>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>
    </>
  );
};

export default EventList;
