"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";

export default function NotificationsList() {
    const [notifications, setNotifications] = useState([]);

    // Example of loading notifications (simulated)
    useEffect(() => {
        setNotifications([
            {
                id: 1,
                title: "New security alert",
                message: "Your account detected suspicious activity. Please review.",
                date: "2025-03-20T14:00:00",
                isRead: false,
            },
            {
                id: 2,
                title: "Application update",
                message: "The application was updated with new features.",
                date: "2025-03-19T09:30:00",
                isRead: true,
            },
            {
                id: 3,
                title: "Meeting reminder",
                message: "Don't forget your meeting at 11:00 AM tomorrow.",
                date: "2025-03-21T11:00:00",
                isRead: false,
            },
        ]);
    }, []);

    const toggleReadStatus = (id) => {
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === id
                    ? { ...notification, isRead: !notification.isRead }
                    : notification
            )
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h1>
            <div className="grid gap-4">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-lg shadow-md transition-colors duration-300 ${
                            notification.isRead
                                ? "bg-white border-l-4 border-green-500"
                                : "bg-blue-50 border-l-4 border-blue-500"
                        }`}
                    >
                        <div className="flex flex-col md:flex-row items-start md:items-center">
                            <Bell className="h-6 w-6 text-blue-600 mr-4" />
                            <div>
                                <p className="text-lg font-medium text-gray-800">
                                    {notification.title}
                                </p>
                                <p className="text-sm text-gray-600">{notification.message}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(notification.date).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => toggleReadStatus(notification.id)}
                            className={`mt-4 md:mt-0 px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300 shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                notification.isRead
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                            {notification.isRead ? "Mark as unread" : "Mark as read"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
