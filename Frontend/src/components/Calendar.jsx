import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import toast from "react-hot-toast";
import api from "../utils/api";

const Calendar = ({ communications, onCommunicationUpdate }) => {
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [openDialog, setOpenDialog] = React.useState(false);

  const isPastDue = (date) => {
    return new Date(date) < new Date();
  };

  const isToday = (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  };

  const events = useMemo(() => {
    return communications.map((comm) => {
      let eventColor;

      if (comm.completed) {
        eventColor = "#4caf50";
      } else if (isPastDue(comm.deadlineDate)) {
        eventColor = "#ff0000";
      } else if (isToday(comm.deadlineDate)) {
        eventColor = "#ffeb3b";
      } else {
        eventColor = "#2196f3";
      }

      return {
        id: comm._id || comm.id,
        title: `${comm.type} - ${comm.companyName || "Unknown Company"}`,
        start: comm.deadlineDate,
        end: comm.deadlineDate,
        display: "block",
        backgroundColor: eventColor,
        borderColor: eventColor,
        textColor: eventColor === "#ffeb3b" ? "#000000" : "#ffffff",
        extendedProps: {
          ...comm,
        },
      };
    });
  }, [communications]);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setOpenDialog(true);
  };

  const handleMarkComplete = async () => {
    try {
      const commId = selectedEvent.id;
      const response = await api.patch(
        `/api/user/communications/${commId}/complete`
      );

      if (response.status === 200) {
        toast.success("Communication marked as complete");
        onCommunicationUpdate && onCommunicationUpdate(response.data);
      }
    } catch (error) {
      console.error("Error marking communication complete:", error);
      toast.error(
        error.response?.data?.message || "Failed to update communication"
      );
    }
    setOpenDialog(false);
  };

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        height="70vh"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        displayEventTime={false}
        eventClassNames="calendar-event"
        eventDisplay="block"
        dayMaxEventRows={false}
        showNonCurrentDates={false}
        fixedWeekCount={false}
        eventDidMount={(info) => {
          info.el.style.backgroundColor = info.event.backgroundColor;
          info.el.style.borderColor = info.event.borderColor;
        }}
        eventContent={(eventInfo) => {
          const backgroundColor = eventInfo.event.backgroundColor;
          const textColor =
            backgroundColor === "#ffeb3b" ? "#000000" : "#ffffff";

          return (
            <Box
              sx={{
                p: 0.5,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                cursor: "pointer",
                fontSize: "0.85em",
                width: "100%",
                height: "100%",
                color: textColor,
                backgroundColor: backgroundColor,
                borderRadius: "3px",
                minHeight: "22px",
              }}
            >
              {eventInfo.event.title}
            </Box>
          );
        }}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Communication Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Type:</strong> {selectedEvent.extendedProps.type}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Company:</strong>{" "}
                {selectedEvent.extendedProps.companyName}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Due Date:</strong>{" "}
                {new Date(selectedEvent.start).toLocaleDateString()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Status:</strong>{" "}
                {selectedEvent.extendedProps.completed
                  ? "Completed"
                  : isPastDue(selectedEvent.start)
                  ? "Overdue"
                  : isToday(selectedEvent.start)
                  ? "Due Today"
                  : "Upcoming"}
              </Typography>
              {selectedEvent.extendedProps.notes && (
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Notes:</strong> {selectedEvent.extendedProps.notes}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {selectedEvent && !selectedEvent.extendedProps.completed && (
            <Button
              onClick={handleMarkComplete}
              variant="contained"
              color="primary"
            >
              Mark as Complete
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Calendar;
