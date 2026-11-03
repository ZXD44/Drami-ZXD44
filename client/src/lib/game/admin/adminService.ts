export type User = {
    id: string;
    username: string;
    email: string | null;
    role: string;
    level: number;
    gold: number;
    diamonds: number;
    exp: number;
    avatar: string | null;
    isBanned: boolean;
    createdAt: string;
};

import { getServerUrl } from "$lib/game/config";

export type AdminStats = {
    totalUsers: number;
    totalGold: number;
    totalDiamonds: number;
    avgLevel: number;
};

const getAdminApiUrl = () => `${getServerUrl()}/api/admin`;

export const adminService = {
    async fetchUsers() {
        const token = localStorage.getItem("drami_token");
        const res = await fetch(`${getAdminApiUrl()}/users`, { headers: { "Authorization": `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch users");
        return await res.json() as User[];
    },

    async fetchStats() {
        const token = localStorage.getItem("drami_token");
        const res = await fetch(`${getAdminApiUrl()}/stats`, { headers: { "Authorization": `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch statistics");
        return await res.json() as AdminStats;
    },

    async fetchItems() {
        const token = localStorage.getItem("drami_token");
        const res = await fetch(`${getAdminApiUrl()}/items`, { headers: { "Authorization": `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch items");
        return await res.json();
    },

    async reloadAllPlayers() {
        const res = await fetch(`${getAdminApiUrl()}/reload-all`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("drami_token")}`
            }
        });
        if (!res.ok) throw new Error("Failed to trigger reload");
        return true;
    },

    async setSpawnPoint(userId: string, x: number, y: number) {
        const res = await fetch(`${getAdminApiUrl()}/set-spawn`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("drami_token")}`
            },
            body: JSON.stringify({ userId, x, y })
        });
        if (!res.ok) throw new Error("Failed to set spawn");
        return await res.json();
    },

    async sendBroadcast(message: string) {
        const res = await fetch(`${getAdminApiUrl()}/broadcast`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("drami_token")}`
            },
            body: JSON.stringify({ message })
        });
        if (!res.ok) throw new Error("Failed to send broadcast");
        return true;
    },

    async giveItem(userId: string, itemId: string, amount: number) {
        const res = await fetch(`${getAdminApiUrl()}/give-item`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("drami_token")}`
            },
            body: JSON.stringify({ userId, itemId, amount })
        });
        if (!res.ok) throw new Error("Failed to give item");
        return true;
    },

    async saveUserChanges(userId: string, data: any) {
        const res = await fetch(`${getAdminApiUrl()}/users/${userId}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("drami_token")}`
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Failed to update user");
        return true;
    },

    async deleteUser(userId: string) {
        const res = await fetch(`${getAdminApiUrl()}/users/${userId}`, { 
            method: "DELETE",
            headers: { "Authorization": `Bearer ${localStorage.getItem("drami_token")}` }
        });
        if (!res.ok) throw new Error("Failed to delete/toggle ban");
        return true;
    }
};
