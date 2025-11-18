"use client";

import { useEffect, useState, memo, useMemo } from "react";
import {
  getUsers,
  promoteUser,
  demoteUser,
  deleteUser,
  type UserData,
} from "@/config/admin";
import toast from "react-hot-toast";
import {
  UserPlus,
  UserMinus,
  Trash2,
  RefreshCw,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SearchBar } from "@/components/admin/SearchBar";
import { Pagination } from "@/components/admin/Pagination";

interface TableRowProps {
  user: UserData;
  onPromote: (id: string, name: string) => void;
  onDemote: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
  isLoading: boolean;
  currentUserId: string;
}

const TableRow = memo(function TableRow({
  user,
  onPromote,
  onDemote,
  onDelete,
  isLoading,
  currentUserId,
}: TableRowProps) {
  const isCurrentUser = user.id === currentUserId;

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-6 py-4">
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
          {isCurrentUser && (
            <span className="text-xs text-blue-600 font-medium">(You)</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-600">{user.faculty}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-600">{user.contact}</div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
            user.role === "admin"
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {user.role === "admin" && <Shield size={12} />}
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
            user.isVerified
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {user.isVerified ? (
            <>
              <CheckCircle size={12} />
              Verified
            </>
          ) : (
            <>
              <XCircle size={12} />
              Not Verified
            </>
          )}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {user.role !== "admin" ? (
            <button
              onClick={() => onPromote(user.id, user.name)}
              disabled={isLoading}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
              title="Promote to Admin"
            >
              <UserPlus size={18} />
            </button>
          ) : (
            !isCurrentUser && (
              <button
                onClick={() => onDemote(user.id, user.name)}
                disabled={isLoading}
                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                title="Demote to User"
              >
                <UserMinus size={18} />
              </button>
            )
          )}
          {!isCurrentUser && (
            <button
              onClick={() => onDelete(user.id, user.name)}
              disabled={isLoading}
              className="p-2 text-[#780606] hover:bg-[#780606] rounded-lg transition-colors disabled:opacity-50"
              title="Delete User"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const itemsPerPage = 10;

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "promote" | "demote" | "delete" | null;
    id: string;
    name: string;
  }>({ isOpen: false, type: null, id: "", name: "" });

  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    // Get current user ID
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as { id: string };
        setCurrentUserId(user.id);
      } catch {
        // ignore
      }
    }
    loadUsers();
  }, []);

  const loadUsers = async (): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const data = await getUsers(token);
      setUsers(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter and search
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== "all" && u.role !== roleFilter) {
        return false;
      }

      // Search filter
      const searchLower = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.faculty.toLowerCase().includes(searchLower)
      );
    });
  }, [users, searchQuery, roleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handlePromoteClick = (id: string, name: string) => {
    setConfirmDialog({ isOpen: true, type: "promote", id, name });
  };

  const handleDemoteClick = (id: string, name: string) => {
    setConfirmDialog({ isOpen: true, type: "demote", id, name });
  };

  const handleDeleteClick = (id: string, name: string) => {
    setConfirmDialog({ isOpen: true, type: "delete", id, name });
  };

  const handleConfirmAction = async () => {
    const token = localStorage.getItem("token");
    if (!token || !confirmDialog.id) return;

    setActionLoading(confirmDialog.id);
    try {
      if (confirmDialog.type === "promote") {
        await promoteUser(token, confirmDialog.id);
        toast.success(`${confirmDialog.name} promoted to admin`);
      } else if (confirmDialog.type === "demote") {
        await demoteUser(token, confirmDialog.id);
        toast.success(`${confirmDialog.name} demoted to user`);
      } else if (confirmDialog.type === "delete") {
        await deleteUser(token, confirmDialog.id);
        toast.success(`${confirmDialog.name} deleted`);
      }
      loadUsers();
      setConfirmDialog({ isOpen: false, type: null, id: "", name: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === "admin").length,
      verified: users.filter((u) => u.isVerified).length,
    };
  }, [users]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Users Management
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-gray-900">{stats.admins}</div>
          <div className="text-sm text-gray-600">Administrators</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="text-2xl font-bold text-gray-900">
            {stats.verified}
          </div>
          <div className="text-sm text-gray-600">Verified Users</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "admin", "user"] as const).map((role) => (
          <button
            key={role}
            onClick={() => {
              setRoleFilter(role);
              setCurrentPage(1);
            }}
            className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${
              roleFilter === role
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
            {role !== "all" && (
              <span className="ml-2 text-xs">
                ({users.filter((u) => u.role === role).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          placeholder="Search by name, email, or faculty..."
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading users...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            {searchQuery ? "No users match your search" : "No users found"}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Faculty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      user={user}
                      onPromote={handlePromoteClick}
                      onDemote={handleDemoteClick}
                      onDelete={handleDeleteClick}
                      isLoading={actionLoading === user.id}
                      currentUserId={currentUserId}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredUsers.length}
                itemsPerPage={itemsPerPage}
              />
            )}
          </>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={
          confirmDialog.type === "promote"
            ? "Promote to Admin?"
            : confirmDialog.type === "demote"
            ? "Demote to User?"
            : "Delete User?"
        }
        message={
          confirmDialog.type === "promote"
            ? `Are you sure you want to promote ${confirmDialog.name} to admin? They will have full access to the admin panel.`
            : confirmDialog.type === "demote"
            ? `Are you sure you want to demote ${confirmDialog.name} to regular user? They will lose admin access.`
            : `Are you sure you want to delete ${confirmDialog.name}? This action cannot be undone.`
        }
        confirmText={
          confirmDialog.type === "promote"
            ? "Promote"
            : confirmDialog.type === "demote"
            ? "Demote"
            : "Delete"
        }
        variant={confirmDialog.type === "delete" ? "danger" : "warning"}
        onConfirm={handleConfirmAction}
        onCancel={() =>
          setConfirmDialog({ isOpen: false, type: null, id: "", name: "" })
        }
      />
    </div>
  );
}
