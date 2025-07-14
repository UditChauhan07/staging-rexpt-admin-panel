import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// Types for the response
interface TableRow {
  userId: number;
  userName: string;
  knowledgeBaseId: string;
}

const DataTable: React.FC = () => {
  const [data, setData] = useState<TableRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 15;

  // Fetch data from the API
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/users');
      setData(response.data); // assuming data is an array of users
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch initial data when the component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Handle search functionality
  const filteredData = useMemo(() => {
    return data.filter(
      (row) =>
        row.userId.toString().includes(searchQuery) ||
        row.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.knowledgeBaseId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, data]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredData, currentPage]);

  // Handle row selection
  const handleRowSelect = (userId: number) => {
    setSelectedRows((prev) => {
      const newSelectedRows = new Set(prev);
      if (newSelectedRows.has(userId)) {
        newSelectedRows.delete(userId);
      } else {
        newSelectedRows.add(userId);
      }
      return newSelectedRows;
    });
  };

  // Delete a single row (user)
  const handleDeleteRow = async (userId: number) => {
    try {
      await axios.delete(`/api/users/${userId}`);
      // After deleting, we remove the user from the local data
      setData((prevData) => prevData.filter((row) => row.userId !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Delete selected rows (batch delete)
  const handleDeleteSelected = async () => {
    try {
      const deletePromises = Array.from(selectedRows).map((userId) =>
        axios.delete(`/api/users/${userId}`)
      );
      await Promise.all(deletePromises);

      // After deletion, filter out the deleted users
      setData((prevData) => prevData.filter((row) => !selectedRows.has(row.userId)));
      setSelectedRows(new Set()); // Clear selection after deletion
    } catch (error) {
      console.error('Error deleting selected users:', error);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedRows.size === filteredData.length}
                onChange={() => {
                  if (selectedRows.size === filteredData.length) {
                    setSelectedRows(new Set());
                  } else {
                    setSelectedRows(new Set(filteredData.map((row) => row.userId)));
                  }
                }}
              />
            </th>
            <th>User ID</th>
            <th>Username</th>
            <th>Knowledge Base ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row) => (
            <tr key={row.userId}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedRows.has(row.userId)}
                  onChange={() => handleRowSelect(row.userId)}
                />
              </td>
              <td>{row.userId}</td>
              <td>{row.userName}</td>
              <td>{row.knowledgeBaseId}</td>
              <td>
                <button onClick={() => handleDeleteRow(row.userId)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredData.length / rowsPerPage) }, (_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={i + 1 === currentPage ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="delete-section">
        <button onClick={handleDeleteSelected} disabled={selectedRows.size === 0}>
          Delete Selected
        </button>
      </div>
    </div>
  );
};

export default DataTable;
