import { useState, useEffect } from "react";
import {
  Box,
  Tab,
  Tabs,
  Typography,
  Container,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import toast from "react-hot-toast";
import api from "../utils/api";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const TabPanel = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`tabpanel-${index}`}
    style={{ width: "100%" }}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const defaultCompanyData = {
  name: "",
  location: "",
  linkedinProfile: "",
  emails: [""],
  phoneNumbers: [""],
  comments: "",
  communicationPeriodicity: 7,
};

const defaultCommunicationData = {
  type: "",
  companyId: "",
  issueDate: new Date().toISOString().split("T")[0],
  deadlineDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  notes: "",
  completed: false,
  completedBy: null,
  completedAt: null,
};

const Admin = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, companiesRes, communicationsRes] = await Promise.all([
        api.get("/api/admin/getusers"),
        api.get("/api/admin/companies"),
        api.get("/api/admin/communications"),
      ]);

      const transformedUsers = (usersRes.data || []).map((user) => ({
        ...user,
        id: user._id || user.id,
      }));

      const transformedCompanies = (companiesRes.data || []).map((company) => ({
        ...company,
        id: company._id || company.id,
        emails: company.emails || [],
        phoneNumbers: company.phoneNumbers || [],
        communicationPeriodicity: company.communicationPeriodicity || 7,
      }));

      const transformedCommunications = (communicationsRes.data || []).map(
        (comm) => ({
          ...comm,
          id: comm._id || comm.id,
          type: comm.type || "N/A",
          companyId: comm.companyId || null,
          issueDate: comm.issueDate || new Date().toISOString(),
          deadlineDate:
            comm.deadlineDate ||
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          notes: comm.notes || "",
          completed: comm.completed || false,
          completedBy: comm.completedBy || null,
          completedAt: comm.completedAt || null,
        })
      );

      console.log("Transformed Data:", {
        users: transformedUsers,
        companies: transformedCompanies,
        communications: transformedCommunications,
      });

      setUsers(transformedUsers);
      setAllUsers(transformedUsers.filter((user) => user.role === "user"));
      setCompanies(transformedCompanies);
      setCommunications(transformedCommunications);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpen = (type, data = null) => {
    setDialogType(type);
    if (data) {
      if (type === "company") {
        setFormData({
          id: data.id,
          name: data.name || "",
          location: data.location || "",
          linkedinProfile: data.linkedinProfile || "",
          emails: data.emails || [""],
          phoneNumbers: data.phoneNumbers || [""],
          communicationPeriodicity: data.communicationPeriodicity || 7,
          comments: data.comments || "",
        });
      } else if (type === "communication") {
        setFormData({
          id: data.id,
          type: data.type || "",
          companyId: data.companyId || "",
          issueDate: data.issueDate
            ? new Date(data.issueDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          deadlineDate: data.deadlineDate
            ? new Date(data.deadlineDate).toISOString().split("T")[0]
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
          notes: data.notes || "",
          completed: data.completed || false,
          completedBy: data.completedBy || null,
          completedAt: data.completedAt || null,
        });
      }
    } else {
      setFormData(
        type === "company" ? defaultCompanyData : defaultCommunicationData
      );
    }
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setFormData({});
  };

  const handleSubmit = async () => {
    try {
      if (dialogType === "company") {
        if (!formData.name || !formData.location || !formData.linkedinProfile) {
          toast.error(
            "Company name, location, and LinkedIn profile are required"
          );
          return;
        }
        if (!formData.emails?.[0]) {
          toast.error("At least one email is required");
          return;
        }
        if (!formData.phoneNumbers?.[0]) {
          toast.error("At least one phone number is required");
          return;
        }

        const companyData = {
          name: formData.name,
          location: formData.location,
          linkedinProfile: formData.linkedinProfile,
          emails: formData.emails.filter((email) => email.trim() !== ""),
          phoneNumbers: formData.phoneNumbers.filter(
            (phone) => phone.trim() !== ""
          ),
          communicationPeriodicity: formData.communicationPeriodicity || 7,
          comments: formData.comments || "",
        };

        if (formData.id) {
          await api.put(`/api/admin/companies/${formData.id}`, companyData);
          toast.success("Company updated successfully");
        } else {
          const response = await api.post("/api/admin/company", companyData);
          console.log("Company creation response:", response.data);
          toast.success("Company created successfully");
        }
      } else if (dialogType === "communication") {
        if (
          !formData.type ||
          !formData.companyId ||
          !formData.issueDate ||
          !formData.deadlineDate
        ) {
          toast.error(
            "Type, company, issue date, and deadline date are required"
          );
          return;
        }

        if (new Date(formData.deadlineDate) < new Date(formData.issueDate)) {
          toast.error("Deadline date cannot be earlier than issue date");
          return;
        }

        const communicationData = {
          type: formData.type,
          companyId: formData.companyId,
          issueDate: formData.issueDate,
          deadlineDate: formData.deadlineDate,
          notes: formData.notes || "",
          completed: formData.completed || false,
          completedBy: formData.completedBy || null,
          completedAt: formData.completedAt || null,
        };

        let response;
        if (formData.id) {
          response = await api.put(
            `/api/admin/communications/${formData.id}`,
            communicationData
          );
          toast.success("Communication updated successfully");
        } else {
          response = await api.post(
            "/api/admin/communications",
            communicationData
          );
          toast.success("Communication created successfully");
        }

        const updatedCommunication = {
          ...response.data,
          id: response.data._id || response.data.id,
        };

        setCommunications((prev) => {
          if (formData.id) {
            return prev.map((comm) =>
              comm.id === formData.id ? updatedCommunication : comm
            );
          } else {
            return [...prev, updatedCommunication];
          }
        });
      }
      handleDialogClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = error.response?.data?.message || "Operation failed";
      console.log("Error details:", error.response?.data);
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (type, id) => {
    try {
      if (type === "company") {
        await api.delete(`/api/admin/companies/${id}`);
        setCompanies((prev) => prev.filter((company) => company.id !== id));
        toast.success("Company deleted successfully");
      } else if (type === "communication") {
        await api.delete(`/api/admin/communications/${id}`);
        setCommunications((prev) => prev.filter((comm) => comm.id !== id));
        toast.success("Communication deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(error.response?.data?.message || "Delete operation failed");
    }
  };

  const handleAddField = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const handleRemoveField = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleFieldChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const userColumns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    {
      field: "createdAt",
      headerName: "Joined",
      flex: 1,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString();
      },
    },
  ];

  const companyColumns = [
    { field: "name", headerName: "Name", width: 130 },
    { field: "location", headerName: "Location", width: 130 },
    {
      field: "primaryEmail",
      headerName: "Primary Email",
      width: 200,
      valueGetter: (params) => {
        if (!params?.row?.emails) return "N/A";
        return params.row.emails[0] || "N/A";
      },
    },
    {
      field: "primaryPhone",
      headerName: "Primary Phone",
      width: 150,
      valueGetter: (params) => {
        if (!params?.row?.phoneNumbers) return "N/A";
        return params.row.phoneNumbers[0] || "N/A";
      },
    },
    {
      field: "communicationPeriodicity",
      headerName: "Contact Frequency (days)",
      width: 180,
      valueGetter: (params) => {
        if (!params?.row) return "N/A";
        return params.row.communicationPeriodicity || "N/A";
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => {
        if (!params?.row) return null;
        return (
          <Box>
            <IconButton
              onClick={() => handleDialogOpen("company", params.row)}
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => handleDelete("company", params.row.id)}
              size="small"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  const communicationColumns = [
    {
      field: "type",
      headerName: "Type",
      width: 150,
      valueGetter: (params) => params?.row?.type || "N/A",
    },
    {
      field: "companyName",
      headerName: "Company",
      width: 200,
      valueGetter: (params) => {
        console.log("Looking up company for row:", params.row);
        console.log("Available companies:", companies);
        const company = companies.find(
          (c) =>
            c.id === params?.row?.companyId ||
            c._id === params?.row?.companyId ||
            c.id === params?.row?.companyId?._id ||
            c._id === params?.row?.companyId?._id
        );
        console.log("Found company:", company);
        return company?.name || "N/A";
      },
    },
    {
      field: "issueDate",
      headerName: "Issue Date",
      width: 120,
      valueGetter: (params) => {
        const date = params?.row?.issueDate;
        return date ? new Date(date).toLocaleDateString() : "N/A";
      },
    },
    {
      field: "deadlineDate",
      headerName: "Deadline",
      width: 120,
      valueGetter: (params) => {
        const date = params?.row?.deadlineDate;
        return date ? new Date(date).toLocaleDateString() : "N/A";
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      valueGetter: (params) => {
        if (!params?.row) return "N/A";
        return params.row.completed ? "Completed" : "Pending";
      },
    },
    {
      field: "notes",
      headerName: "Notes",
      width: 200,
      valueGetter: (params) => params?.row?.notes || "N/A",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleDialogOpen("communication", params.row)}
            size="small"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => handleDelete("communication", params.row.id)}
            size="small"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const gridStyles = {
    height: 600,
    width: "100%",
    backgroundColor: "#fff",
    "& .MuiDataGrid-root": {
      border: "none",
    },
    "& .MuiDataGrid-cell": {
      borderBottom: "1px solid #f0f0f0",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#f5f5f5",
      borderBottom: "none",
    },
    "& .MuiDataGrid-virtualScroller": {
      backgroundColor: "#fff",
    },
    "& .MuiDataGrid-footerContainer": {
      borderTop: "1px solid #f0f0f0",
    },
    "& .MuiDataGrid-row:hover": {
      backgroundColor: "#f5f5f5",
    },
  };

  const DataGridWithErrorBoundary = ({ rows = [], ...props }) => {
    const validRows = Array.isArray(rows)
      ? rows.map((row) => ({
          ...row,
          id: row.id || row._id,
        }))
      : [];

    return (
      <Box sx={{ height: 600, width: "100%", mb: 2 }}>
        <DataGrid
          rows={validRows}
          {...props}
          getRowId={(row) => row.id}
          autoHeight={false}
          components={{
            NoRowsOverlay: () => (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                No data available
              </Box>
            ),
          }}
        />
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>
      <Paper elevation={3} sx={{ width: "100%", overflow: "hidden" }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Users" />
          <Tab label="Companies" />
          <Tab label="Communications" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ height: 600, width: "100%", backgroundColor: "#fff" }}>
            <DataGridWithErrorBoundary
              rows={users}
              columns={userColumns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
              loading={loading}
              sx={gridStyles}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Button
            variant="contained"
            onClick={() => handleDialogOpen("company")}
            sx={{ mb: 2 }}
          >
            Add Company
          </Button>
          <Box sx={{ height: 600, width: "100%", backgroundColor: "#fff" }}>
            <DataGridWithErrorBoundary
              rows={companies}
              columns={companyColumns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
              loading={loading}
              sx={gridStyles}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ width: "100%" }}>
            <Button
              variant="contained"
              onClick={() => handleDialogOpen("communication")}
              sx={{ mb: 2 }}
            >
              Add Communication
            </Button>
            <Box sx={{ height: 600, width: "100%", backgroundColor: "#fff" }}>
              <DataGrid
                rows={communications}
                columns={communicationColumns}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
                loading={loading}
                getRowId={(row) => row.id || row._id}
                sx={gridStyles}
              />
            </Box>
          </Box>
        </TabPanel>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {formData.id ? "Edit" : "Add"}{" "}
          {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}
        </DialogTitle>
        <DialogContent>
          {dialogType === "company" && (
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <TextField
                fullWidth
                label="Company Name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                margin="normal"
                required
                error={!formData.name}
                helperText={!formData.name ? "Company name is required" : ""}
              />
              <TextField
                fullWidth
                label="Location"
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                margin="normal"
                required
                error={!formData.location}
                helperText={!formData.location ? "Location is required" : ""}
              />
              <TextField
                fullWidth
                label="LinkedIn Profile"
                value={formData.linkedinProfile || ""}
                onChange={(e) =>
                  setFormData({ ...formData, linkedinProfile: e.target.value })
                }
                margin="normal"
                required
                error={!formData.linkedinProfile}
                helperText={
                  !formData.linkedinProfile
                    ? "LinkedIn profile is required"
                    : ""
                }
              />

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Email Addresses
              </Typography>
              {formData.emails?.map((email, index) => (
                <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label={`Email ${index + 1}`}
                    value={email}
                    onChange={(e) =>
                      handleFieldChange("emails", index, e.target.value)
                    }
                    type="email"
                    required={index === 0}
                    error={index === 0 && !email}
                    helperText={
                      index === 0 && !email ? "Primary email is required" : ""
                    }
                  />
                  {index === formData.emails.length - 1 ? (
                    <IconButton
                      onClick={() => handleAddField("emails")}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={() => handleRemoveField("emails", index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Phone Numbers
              </Typography>
              {formData.phoneNumbers?.map((phone, index) => (
                <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label={`Phone ${index + 1}`}
                    value={phone}
                    onChange={(e) =>
                      handleFieldChange("phoneNumbers", index, e.target.value)
                    }
                    required={index === 0}
                    error={index === 0 && !phone}
                    helperText={
                      index === 0 && !phone ? "Primary phone is required" : ""
                    }
                  />
                  {index === formData.phoneNumbers.length - 1 ? (
                    <IconButton
                      onClick={() => handleAddField("phoneNumbers")}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={() => handleRemoveField("phoneNumbers", index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}

              <TextField
                fullWidth
                label="Contact Frequency (days)"
                type="number"
                value={formData.communicationPeriodicity || 7}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    communicationPeriodicity: parseInt(e.target.value) || 7,
                  })
                }
                margin="normal"
                required
                InputProps={{ inputProps: { min: 1 } }}
              />

              <TextField
                fullWidth
                label="Comments"
                value={formData.comments || ""}
                onChange={(e) =>
                  setFormData({ ...formData, comments: e.target.value })
                }
                margin="normal"
                multiline
                rows={4}
              />
            </Box>
          )}
          {dialogType === "communication" && (
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <TextField
                select
                fullWidth
                label="Type"
                value={formData.type || ""}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                margin="normal"
                required
                error={!formData.type}
                helperText={
                  !formData.type ? "Communication type is required" : ""
                }
                SelectProps={{ native: true }}
              >
                <option value="">Select Type</option>
                <option value="Email">Email</option>
                <option value="Phone Call">Phone Call</option>
                <option value="LinkedIn Message">LinkedIn Message</option>
                <option value="LinkedIn Post">LinkedIn Post</option>
              </TextField>

              <TextField
                select
                fullWidth
                label="Company"
                value={formData.companyId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, companyId: e.target.value })
                }
                margin="normal"
                required
                error={!formData.companyId}
                helperText={!formData.companyId ? "Company is required" : ""}
                SelectProps={{ native: true }}
              >
                <option value="">Select Company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Issue Date"
                type="date"
                value={formData.issueDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, issueDate: e.target.value })
                }
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Deadline Date"
                type="date"
                value={formData.deadlineDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, deadlineDate: e.target.value })
                }
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
                error={
                  new Date(formData.deadlineDate) < new Date(formData.issueDate)
                }
                helperText={
                  new Date(formData.deadlineDate) < new Date(formData.issueDate)
                    ? "Deadline must be after issue date"
                    : ""
                }
              />

              <TextField
                fullWidth
                label="Notes"
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                margin="normal"
                multiline
                rows={4}
              />

              <Box sx={{ mt: 2 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.completed || false}
                    onChange={(e) => {
                      const now = new Date().toISOString();
                      const currentUser = JSON.parse(
                        localStorage.getItem("user")
                      );
                      setFormData({
                        ...formData,
                        completed: e.target.checked,
                        completedBy: e.target.checked ? currentUser._id : null,
                        completedAt: e.target.checked ? now : null,
                      });
                    }}
                    style={{ marginRight: "8px" }}
                  />
                  Mark as Completed
                </label>
                {formData.completed && formData.completedBy && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 1, color: "text.secondary" }}
                  >
                    Completed by:{" "}
                    {allUsers.find((u) => u.id === formData.completedBy)
                      ?.name || "Unknown"}
                    <br />
                    Completed on:{" "}
                    {new Date(formData.completedAt).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              dialogType === "company" &&
              (!formData.name ||
                !formData.location ||
                !formData.emails?.[0] ||
                !formData.phoneNumbers?.[0])
            }
          >
            {formData.id ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin;
