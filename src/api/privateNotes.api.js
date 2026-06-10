// ✅ replace entire file
import axiosInstance from "@utils/axiosInstance";

export const createPrivateNote = async (connectRequestId, title, content) => {
  const res = await axiosInstance.post("/private-notes", { connectRequestId, title, content });
  return res.data;
};

export const getPrivateNotes = async (connectRequestId) => {
  const res = await axiosInstance.get(`/private-notes/${connectRequestId}`);
  return res.data;
};

export const updatePrivateNote = async (noteId, title, content) => {
  const res = await axiosInstance.patch(`/private-notes/${noteId}`, { title, content });
  return res.data;
};

export const deletePrivateNote = async (noteId) => {
  const res = await axiosInstance.delete(`/private-notes/${noteId}`);
  return res.data;
};