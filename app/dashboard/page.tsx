"use client";
import React, { useEffect, useState } from "react";

interface UserType {
  _id: string;
  name: string;
  email: string;
}
const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");

        if (!response.ok) {
          throw new Error("Users not found");
        }

        const data = await response.json();

        setUsers(data.users);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      {users.map((user: UserType) => (
        <div key={user._id}>
          <p>Name:{user.name}</p>
          <p>Password: {user.email}</p>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
