// hooks/useUpdateEvent.js
import { useDispatch } from "react-redux";
import {
  updateEventStart,
  updateEventSuccess,
  updateEventFailure,
} from "../../redux/eventStore/eventSlice";

export const useUpdateEvent = () => {
  const dispatch = useDispatch();

  const updateEvent = async (eventId, updatedData, token) => {
    dispatch(updateEventStart());
    console.log("Updating event with ID:", eventId);
    console.log("Updated data:", updatedData);
    try {
      const res = await fetch(`/api/event/update-event/${eventId}`, {
        method: "PUT",
        body: updatedData,
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update event");
      }

      const data = await res.json();
      dispatch(updateEventSuccess(data.event));
      return data.event;
    } catch (error) {
      console.error("Update Event Error:", error.message);
      dispatch(updateEventFailure(error.message));
    }
  };

  return { updateEvent };
};
