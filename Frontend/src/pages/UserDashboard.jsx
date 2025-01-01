import { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
  Badge,
  Checkbox,
  FormControlLabel,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import NotificationsIcon from "@mui/icons-material/Notifications";
import api from "../utils/api";
import toast from "react-hot-toast";
import { format, isToday, isPast } from "date-fns";
import Calendar from "../components/Calendar";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TodayIcon from "@mui/icons-material/Today";
import UpdateIcon from "@mui/icons-material/Update";

const UserDashboard = () => {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isCalendarViewOpen, setIsCalendarViewOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedCommunications, setSelectedCommunications] = useState([]);
  const [pendingCommunications, setPendingCommunications] = useState([]);
  const [newCommunication, setNewCommunication] = useState({
    type: "",
    date: new Date(),
    notes: "",
  });
  const [highlightOverrides, setHighlightOverrides] = useState({});
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [disabledHighlights, setDisabledHighlights] = useState({});

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/user/communications");
      setCommunications(response.data);
      console.log(response.data);
      console.log(communications);
    } catch (error) {
      console.error("Error fetching communications:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch communications"
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate notifications
  const notifications = useMemo(() => {
    const overdue = [];
    const dueToday = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log(
      "Calculating notifications from communications:",
      communications
    );

    communications.forEach((comm) => {
      if (comm.completed) return;

      const deadlineDate = new Date(comm.deadlineDate);
      deadlineDate.setHours(0, 0, 0, 0);

      console.log("Checking communication:", {
        id: comm._id,
        type: comm.type,
        deadline: deadlineDate,
        isOverdue: deadlineDate < today,
        isDueToday: deadlineDate.getTime() === today.getTime(),
      });

      if (deadlineDate < today) {
        overdue.push({
          companyName: comm.companyName,
          communication: comm,
        });
      } else if (deadlineDate.getTime() === today.getTime()) {
        dueToday.push({
          companyName: comm.companyName,
          communication: comm,
        });
      }
    });

    console.log("Notification results:", {
      overdue: overdue.length,
      dueToday: dueToday.length,
      overdueItems: overdue,
      dueTodayItems: dueToday,
    });

    return { overdue, dueToday };
  }, [communications]);

  // Process communications by company
  const companyCommunications = useMemo(() => {
    const companyMap = new Map();

    communications.forEach((comm) => {
      if (!companyMap.has(comm.companyId)) {
        companyMap.set(comm.companyId, {
          id: comm.companyId,
          companyName: comm.companyName,
          communications: [],
          location: comm.companyLocation,
        });
      }
      companyMap.get(comm.companyId).communications.push(comm);
    });

    return Array.from(companyMap.values()).map((company) => ({
      ...company,
      communications: company.communications.sort(
        (a, b) => new Date(b.issueDate) - new Date(a.issueDate)
      ),
    }));
  }, [communications]);

  const handleComplete = async (communicationId) => {
    try {
      const response = await api.patch(
        `/api/user/communications/${communicationId}/complete`
      );

      if (response.data) {
        toast.success("Communication marked as complete");
        fetchCommunications();
      }
    } catch (error) {
      console.error("Error completing communication:", error);
      toast.error(
        error.response?.data?.message || "Failed to complete communication"
      );
    }
  };

  const handleOpenCompleteModal = (companyId) => {
    const company = companyCommunications.find((c) => c.id === companyId);
    if (company) {
      const pending = company.communications.filter((c) => !c.completed);
      setPendingCommunications(pending);
      setSelectedCommunications([]);
      setIsCompleteModalOpen(true);
    }
  };

  const handleCompleteMultiple = async () => {
    if (selectedCommunications.length === 0) {
      toast.error("Please select at least one communication");
      return;
    }

    try {
      const response = await api.post(
        "/api/user/communications/complete-multiple",
        {
          communicationIds: selectedCommunications,
        }
      );
      toast.success(response.data.message);
      setIsCompleteModalOpen(false);
      setSelectedCommunications([]);
      fetchCommunications();
    } catch (error) {
      console.error("Error completing communications:", error);
      toast.error("Failed to complete communications");
    }
  };

  const handleCommunicationClick = (comm) => {
    setSelectedCommunication(comm);
    setIsViewModalOpen(true);
  };

  const columns = [
    {
      field: "company",
      headerName: "Company",
      flex: 2,
      renderCell: (params) => (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 500, color: "#1a237e" }}>
            {params.row.companyName}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontSize: "0.875rem" }}
          >
            {params.row.location}
          </Typography>
        </Box>
      ),
    },
    {
      field: "recentCommunications",
      headerName: "Last Communications",
      flex: 3,
      renderCell: (params) => {
        const recentComms = params.row.communications.slice(0, 5).map((c) => {
          const deadlineDate = new Date(c.deadlineDate);
          const today = new Date();
          // Set hours to 0 for accurate date comparison
          deadlineDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          const isOverdue = !c.completed && deadlineDate < today;
          const isDueToday =
            !c.completed && deadlineDate.getTime() === today.getTime();
          const shouldHighlight = !disabledHighlights[params.row.id];

          let bgColor = c.completed ? "#e8f5e9" : "#fff";
          let borderColor = c.completed ? "#81c784" : "#e0e0e0";
          let textColor = c.completed ? "#2e7d32" : "#1a237e";

          if (shouldHighlight) {
            if (isOverdue) {
              bgColor = "#ffebee";
              borderColor = "#ef5350";
              textColor = "#d32f2f";
            } else if (isDueToday) {
              bgColor = "#fff3e0";
              borderColor = "#ffb74d";
              textColor = "#ed6c02";
            }
          }

          return (
            <Tooltip
              key={c._id}
              title={`${c.notes || "No notes"}${
                c.completed ? " (Completed)" : ""
              }`}
              arrow
              placement="top"
            >
              <Box
                onClick={() => handleCommunicationClick(c)}
                sx={{
                  p: "8px 16px",
                  m: "4px",
                  bgcolor: bgColor,
                  border: 1,
                  borderColor: borderColor,
                  borderRadius: 2,
                  fontSize: "0.875rem",
                  color: textColor,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  minWidth: "fit-content",
                  maxWidth: "100%",
                  wordBreak: "break-word",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  },
                }}
              >
                {c.completed ? (
                  <CheckCircleIcon fontSize="small" />
                ) : isOverdue ? (
                  <ErrorOutlineIcon fontSize="small" />
                ) : isDueToday ? (
                  <TodayIcon fontSize="small" />
                ) : (
                  <ScheduleIcon fontSize="small" />
                )}
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <Typography sx={{ fontWeight: 500 }}>{c.type}</Typography>
                  <Typography sx={{ fontSize: "0.75rem" }}>
                    {format(new Date(c.issueDate), "MMM d")}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          );
        });

        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!disabledHighlights[params.row.id]}
                    onChange={(e) => {
                      setDisabledHighlights((prev) => ({
                        ...prev,
                        [params.row.id]: !e.target.checked,
                      }));
                    }}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Show Highlights
                  </Typography>
                }
              />
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {recentComms}
            </Box>
          </Box>
        );
      },
    },
    {
      field: "nextCommunication",
      headerName: "Next Due",
      flex: 1.5,
      renderCell: (params) => {
        const nextComm = params.row.communications.find((c) => !c.completed);
        if (!nextComm) return "-";
        const dueDate = new Date(nextComm.deadlineDate);
        const isOverdue = isPast(dueDate);
        const isDueToday = isToday(dueDate);

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: isOverdue ? "#d32f2f" : isDueToday ? "#ed6c02" : "#1a237e",
            }}
          >
            {isOverdue ? (
              <ErrorOutlineIcon fontSize="small" />
            ) : isDueToday ? (
              <TodayIcon fontSize="small" />
            ) : (
              <UpdateIcon fontSize="small" />
            )}
            {format(dueDate, "MMM d, yyyy")}
          </Box>
        );
      },
    },
    {
      field: "pendingCommunications",
      headerName: "Pending",
      flex: 1,
      renderCell: (params) => {
        const pendingCount = params.row.communications.filter(
          (c) => !c.completed
        ).length;
        if (pendingCount === 0) return null;

        return (
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Chip
              label={`${pendingCount} pending`}
              size="small"
              sx={{
                backgroundColor: "#e3f2fd",
                color: "#1a237e",
                fontWeight: 500,
              }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={() => handleOpenCompleteModal(params.row.id)}
              sx={{
                textTransform: "none",
                backgroundColor: "#1a237e",
                "&:hover": {
                  backgroundColor: "#0d47a1",
                },
              }}
            >
              Complete
            </Button>
          </Box>
        );
      },
    },
  ];

  const handleActionSubmit = async () => {
    try {
      // Here you would make API call to save the new communication
      toast.success("Communication logged successfully");
      setIsActionModalOpen(false);
      fetchCommunications();
    } catch (error) {
      toast.error("Failed to log communication");
    }
  };

  const notificationColumns = [
    { field: "companyName", headerName: "Company", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },
    {
      field: "dueDate",
      headerName: "Due Date",
      flex: 1,
      valueFormatter: (params) => params.value.toLocaleDateString(),
    },
    { field: "notes", headerName: "Notes", flex: 1.5 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          onClick={() => {
            handleComplete(params.row.communicationId);
            setIsNotificationModalOpen(false);
          }}
          sx={{
            textTransform: "none",
            backgroundColor: "#1a237e",
            "&:hover": {
              backgroundColor: "#0d47a1",
            },
          }}
        >
          Mark Complete
        </Button>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 6, backgroundColor: "#f8f9fa" }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 5,
          pb: 3,
          background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)",
          mx: -3,
          px: 3,
          py: 4,
          borderRadius: "0 0 30px 30px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          },
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              color: "rgba(255,255,255,0.8)",
              mb: 1,
              letterSpacing: 1,
            }}
          >
            Welcome back
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: 0.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {user.name}
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                backgroundColor: "#4caf50",
                borderRadius: "50%",
                display: "inline-block",
                ml: 2,
                boxShadow: "0 0 0 3px rgba(76,175,80,0.3)",
              }}
            />
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Tooltip title="View Notifications">
            <IconButton
              onClick={() => setIsNotificationModalOpen(true)}
              sx={{
                backgroundColor: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.2)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <Badge
                badgeContent={
                  notifications.overdue.length + notifications.dueToday.length
                }
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#ff4444",
                    color: "white",
                    boxShadow: "0 2px 4px rgba(255,68,68,0.3)",
                  },
                }}
              >
                <NotificationsIcon sx={{ color: "white" }} />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Communications Table Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          backgroundColor: "white",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "#1a237e",
            mb: 3,
          }}
        >
          Company Communications
        </Typography>

        <DataGrid
          rows={companyCommunications}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoHeight
          loading={loading}
          disableSelectionOnClick
          getRowHeight={() => "auto"}
          sx={{
            minHeight: 400,
            border: "none",
            "& .MuiDataGrid-cell": {
              borderColor: "rgba(0,0,0,0.05)",
              padding: "5px 16px",
              whiteSpace: "normal",
              minHeight: "50px !important",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f8f9fa",
              borderRadius: 1,
            },
            "& .MuiDataGrid-row": {
              "&:hover": {
                backgroundColor: "#f8f9fa",
              },
            },
            "& .MuiDataGrid-virtualScroller": {
              marginTop: "0 !important",
            },
            "& .MuiDataGrid-row:not(:last-child)": {
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              marginBottom: 1,
            },
          }}
        />
      </Paper>

      {/* Calendar Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          backgroundColor: "white",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: "#1a237e",
          }}
        >
          Calendar View
        </Typography>
        <Box sx={{ height: "600px" }}>
          <Calendar
            communications={communications}
            onCommunicationUpdate={fetchCommunications}
          />
        </Box>
      </Paper>

      {/* Action Modal */}
      <Dialog
        open={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            px: 3,
            py: 2.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a237e" }}>
            Log Communication
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            select
            fullWidth
            label="Communication Type"
            value={newCommunication.type}
            onChange={(e) =>
              setNewCommunication((prev) => ({ ...prev, type: e.target.value }))
            }
            sx={{
              mb: 3,
              mt: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          >
            <MenuItem value="LinkedIn Post">LinkedIn Post</MenuItem>
            <MenuItem value="Email">Email</MenuItem>
            <MenuItem value="Phone Call">Phone Call</MenuItem>
          </TextField>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Communication Date"
              value={newCommunication.date}
              onChange={(newDate) =>
                setNewCommunication((prev) => ({ ...prev, date: newDate }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              )}
            />
          </LocalizationProvider>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes"
            value={newCommunication.notes}
            onChange={(e) =>
              setNewCommunication((prev) => ({
                ...prev,
                notes: e.target.value,
              }))
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <Button
            onClick={() => setIsActionModalOpen(false)}
            sx={{
              textTransform: "none",
              color: "#666",
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleActionSubmit}
            variant="contained"
            sx={{
              textTransform: "none",
              px: 3,
              backgroundColor: "#1a237e",
              "&:hover": {
                backgroundColor: "#0d47a1",
              },
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications Modal */}
      <Dialog
        open={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            px: 3,
            py: 2.5,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a237e" }}>
            Notifications
          </Typography>
          <Badge
            badgeContent={
              notifications.overdue.length + notifications.dueToday.length
            }
            color="error"
            sx={{
              ml: 2,
              "& .MuiBadge-badge": {
                backgroundColor: "#ff4444",
              },
            }}
          />
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {notifications.overdue.length === 0 &&
          notifications.dueToday.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: "#666",
              }}
            >
              <Typography variant="h6">No pending notifications</Typography>
              <Typography variant="body2" sx={{ mt: 1, color: "#888" }}>
                You're all caught up!
              </Typography>
            </Box>
          ) : (
            <Box>
              {notifications.overdue.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#d32f2f",
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    Overdue Communications
                  </Typography>
                  <DataGrid
                    rows={notifications.overdue.map((item) => ({
                      id: item.communication._id,
                      companyName: item.companyName,
                      type: item.communication.type,
                      dueDate: new Date(item.communication.deadlineDate),
                      notes: item.communication.notes || "No notes",
                      communicationId: item.communication._id,
                    }))}
                    columns={notificationColumns}
                    autoHeight
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
                    sx={{
                      border: "none",
                      "& .MuiDataGrid-row": {
                        backgroundColor: "#fff5f5",
                        "&:hover": {
                          backgroundColor: "#ffe5e5",
                        },
                      },
                      "& .MuiDataGrid-cell": {
                        borderColor: "rgba(0,0,0,0.05)",
                      },
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#f8f9fa",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>
              )}

              {notifications.dueToday.length > 0 && (
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#ed6c02",
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    Due Today
                  </Typography>
                  <DataGrid
                    rows={notifications.dueToday.map((item) => ({
                      id: item.communication._id,
                      companyName: item.companyName,
                      type: item.communication.type,
                      dueDate: new Date(item.communication.deadlineDate),
                      notes: item.communication.notes || "No notes",
                      communicationId: item.communication._id,
                    }))}
                    columns={notificationColumns}
                    autoHeight
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
                    sx={{
                      border: "none",
                      "& .MuiDataGrid-row": {
                        backgroundColor: "#fff9c4",
                        "&:hover": {
                          backgroundColor: "#fff59d",
                        },
                      },
                      "& .MuiDataGrid-cell": {
                        borderColor: "rgba(0,0,0,0.05)",
                      },
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#f8f9fa",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <Button
            onClick={() => setIsNotificationModalOpen(false)}
            sx={{
              textTransform: "none",
              px: 4,
              backgroundColor: "#f5f6f8",
              color: "#666",
              "&:hover": {
                backgroundColor: "#e8e9eb",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Communications Modal */}
      <Dialog
        open={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            px: 3,
            py: 2.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a237e" }}>
            Complete Communications
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {pendingCommunications.length === 0 ? (
            <Typography>No pending communications</Typography>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select communications to mark as complete:
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {pendingCommunications.map((comm) => (
                  <Paper
                    key={comm._id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.08)",
                      backgroundColor: selectedCommunications.includes(comm._id)
                        ? "#e3f2fd"
                        : "white",
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedCommunications.includes(comm._id)}
                          onChange={(e) => {
                            setSelectedCommunications((prev) =>
                              e.target.checked
                                ? [...prev, comm._id]
                                : prev.filter((id) => id !== comm._id)
                            );
                          }}
                          sx={{
                            color: "#1a237e",
                            "&.Mui-checked": {
                              color: "#1a237e",
                            },
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 500, color: "#1a237e" }}
                          >
                            {comm.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Due:{" "}
                            {format(new Date(comm.deadlineDate), "MMM d, yyyy")}
                          </Typography>
                          {comm.notes && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              Notes: {comm.notes}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </Paper>
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <Button
            onClick={() => setIsCompleteModalOpen(false)}
            sx={{
              textTransform: "none",
              color: "#666",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCompleteMultiple}
            variant="contained"
            disabled={selectedCommunications.length === 0}
            sx={{
              textTransform: "none",
              backgroundColor: "#1a237e",
              "&:hover": {
                backgroundColor: "#0d47a1",
              },
              "&.Mui-disabled": {
                backgroundColor: "rgba(26,35,126,0.12)",
              },
            }}
          >
            Complete Selected ({selectedCommunications.length})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Communication View Modal */}
      <Dialog
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            px: 3,
            py: 2.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a237e" }}>
            Communication Details
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedCommunication && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body1">
                  {selectedCommunication.type}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Company
                </Typography>
                <Typography variant="body1">
                  {selectedCommunication.companyName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Issue Date
                </Typography>
                <Typography variant="body1">
                  {format(
                    new Date(selectedCommunication.issueDate),
                    "MMM d, yyyy"
                  )}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body1">
                  {format(
                    new Date(selectedCommunication.deadlineDate),
                    "MMM d, yyyy"
                  )}
                </Typography>
              </Box>
              {selectedCommunication.notes && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body1">
                    {selectedCommunication.notes}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: selectedCommunication.completed
                      ? "#2e7d32"
                      : isPast(new Date(selectedCommunication.deadlineDate))
                      ? "#d32f2f"
                      : isToday(new Date(selectedCommunication.deadlineDate))
                      ? "#ed6c02"
                      : "#1a237e",
                  }}
                >
                  {selectedCommunication.completed
                    ? "Completed"
                    : isPast(new Date(selectedCommunication.deadlineDate))
                    ? "Overdue"
                    : isToday(new Date(selectedCommunication.deadlineDate))
                    ? "Due Today"
                    : "Upcoming"}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <Button
            onClick={() => setIsViewModalOpen(false)}
            sx={{
              textTransform: "none",
              color: "#666",
            }}
          >
            Cancel
          </Button>
          {selectedCommunication && !selectedCommunication.completed && (
            <Button
              onClick={() => {
                handleComplete(selectedCommunication._id);
                setIsViewModalOpen(false);
              }}
              variant="contained"
              sx={{
                textTransform: "none",
                backgroundColor: "#1a237e",
                "&:hover": {
                  backgroundColor: "#0d47a1",
                },
              }}
            >
              Mark as Complete
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserDashboard;
