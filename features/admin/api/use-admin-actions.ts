import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSendReminder() {
  return useMutation({
    mutationFn: async (_appointmentId: string) => {
      toast.info("Reminder feature — implement your own logic");
    },
  });
}
