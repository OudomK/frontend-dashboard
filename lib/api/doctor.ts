import { apiClient } from "../api-client";

export interface GenerateSlotsPayload {
  date: string;
  start_time: string;
  end_time: string;
  interval_minutes: number;
}

export const doctorApi = {
  getMySlots: async () => {
    const res = await apiClient.get("/api/v1/doctors/me/slots");
    return res.data;
  },

  getMyAppointments: async () => {
    const res = await apiClient.get("/api/v1/doctors/me/appointments");
    return res.data;
  },

  generateMySlots: async (payload: GenerateSlotsPayload) => {
    const res = await apiClient.post("/api/v1/doctors/me/slots/generate", payload);
    return res.data;
  },

  deleteMySlot: async (slotId: number) => {
    const res = await apiClient.delete(`/api/v1/doctors/me/slots/${slotId}`);
    return res.data;
  },

  blockMySlot: async (slotId: number) => {
    const res = await apiClient.patch(`/api/v1/doctors/me/slots/${slotId}/block`);
    return res.data;
  },

  reopenMySlot: async (slotId: number) => {
    const res = await apiClient.patch(`/api/v1/doctors/me/slots/${slotId}/reopen`);
    return res.data;
  },

  cancelMyAppointment: async (apptId: number, reason?: string) => {
    const res = await apiClient.post(`/api/v1/doctors/me/appointments/${apptId}/cancel`, {
      reason,
    });
    return res.data;
  },
};
