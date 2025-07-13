'use client';
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/redux/store";
import {
    updateAllocation,
    updatePlayers,
    showAlert,
} from "@/redux/store";
import {
    faCheckCircle,
    faChevronLeft,
    faBan,
    faPaperPlane,
    faSkull,
    faHeart,
    faUsers,
    faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import roleDescriptions from "../../roleDescriptions.json";
import NavigationLinks from "@/components/NavigationLinks";
import Alert from "@/components/Alert";
import type { RoleDescriptions, Player, AllocatedPlayer } from "@/types/game";

const isValidUrl = (str: string): boolean => {
    const pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
        "i"
    ); // fragment locator
    return !!pattern.test(str);
};

export default function GameManagementPage() {
    const router = useRouter();
    const dispatch = useDispatch();

    // Hydration check to prevent SSR mismatches
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const playerNames = useSelector((state: RootState) => state.game.playerNames);
    const allocation = useSelector((state: RootState) => state.game.allocation);

    const aliveAllocation = allocation.filter((role: AllocatedPlayer) => role.alive);
    const mafiaAlive = aliveAllocation.filter((role: AllocatedPlayer) => role.type === "M").length;
    const villageAlive = aliveAllocation.filter((role: AllocatedPlayer) => role.type === "V").length;

    const getGameStatus = () => {
        if (mafiaAlive === 0 && villageAlive === 0) {
            return {
                message: "Start a game first",
                color: "text-slate-500",
                bgColor: "bg-slate-100",
            };
        } else if (mafiaAlive >= villageAlive) {
            return {
                message: "Mafia Wins!",
                color: "text-white",
                bgColor: "bg-red-600",
            };
        } else if (villageAlive > 0 && mafiaAlive === 0) {
            return {
                message: "Village Wins!",
                color: "text-white",
                bgColor: "bg-green-600",
            };
        }
        return {
            message: "Game in Progress",
            color: "text-blue-700",
            bgColor: "bg-blue-100",
        };
    };

    const gameStatus = getGameStatus();

    const getRoleTypeStyle = (role: AllocatedPlayer) => {
        if (role.allotedRole === "godfather")
            return "text-orange-600 bg-orange-50 border-orange-200";
        if (role.type === "M") return "text-red-600 bg-red-50 border-red-200";
        if (role.type === "V") return "text-green-600 bg-green-50 border-green-200";
        if (role.type === "N")
            return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-slate-600 bg-slate-50 border-slate-200";
    };

    const sendWebhook = async (playerIndex: number, role: AllocatedPlayer) => {
        const player = playerNames[playerIndex] as Player;
        if (!player || !isValidUrl(player.hook || "")) return;

        try {
            let otherAlerts: (AllocatedPlayer & { index: number })[] = [];
            if (role.type === "M") {
                otherAlerts = allocation
                    .map((role: AllocatedPlayer, index: number) => ({ ...role, index }))
                    .filter((role) => role.type === "M");
            }

            const notes = (roleDescriptions as RoleDescriptions)[role.allotedRole].player;
            let message = `Your role: ${role.allotedRole}. ${notes}`;

            if (otherAlerts.length > 1) {
                const otherPlayers = otherAlerts
                    .filter((r) => r.index !== playerIndex)
                    .map((r) => (playerNames[r.index] as Player).name)
                    .join(", ");
                message += ` Other mafia: ${otherPlayers}`;
            }

            await fetch(player.hook!, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: message }),
            });

            dispatch(showAlert({
                body: `Sent role to ${player.name}`,
                header: "Success"
            }));
        } catch (error) {
            dispatch(showAlert({
                body: `Failed to send to ${player.name}`,
                header: "Error"
            }));
        }
    };

    // If not hydrated, show loading state to prevent hydration mismatch
    if (!isHydrated) {
        return (
            <>
                <NavigationLinks />
                <div className="pt-20 p-6 min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
                        <p className="text-slate-700 text-lg">Loading Game Management...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <NavigationLinks />
            <Alert />
            <div className="pt-20 p-6 min-h-screen mt-10">
                <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push("/")}
                            className="btn-secondary flex items-center space-x-2"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                            <span>Back to Setup</span>
                        </button>
                        <h1 className="text-3xl font-bold text-slate-900">Game Management</h1>
                    </div>

                    {/* Game Status */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center">
                                <FontAwesomeIcon icon={faTrophy} className="mr-3 text-yellow-600" />
                                Game Status
                            </h2>
                        </div>
                        <div className="card-body">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600 flex items-center justify-center">
                                        <FontAwesomeIcon icon={faSkull} className="mr-2" />
                                        {mafiaAlive}
                                    </div>
                                    <p className="text-sm text-slate-600">Mafia Alive</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
                                        <FontAwesomeIcon icon={faHeart} className="mr-2" />
                                        {villageAlive}
                                    </div>
                                    <p className="text-sm text-slate-600">Village Alive</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600 flex items-center justify-center">
                                        <FontAwesomeIcon icon={faUsers} className="mr-2" />
                                        {aliveAllocation.length}
                                    </div>
                                    <p className="text-sm text-slate-600">Total Alive</p>
                                </div>
                                <div className="text-center">
                                    <div
                                        className={`px-4 py-2 rounded-lg font-bold ${gameStatus.bgColor} ${gameStatus.color}`}
                                    >
                                        {gameStatus.message}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Players List */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="text-xl font-bold text-slate-900">Players & Roles</h2>
                            <p className="text-sm text-slate-600 mt-1">
                                Manage player status and webhook notifications
                            </p>
                        </div>
                        <div className="card-body">
                            <div className="space-y-4">
                                {allocation.map((role: AllocatedPlayer, i: number) => (
                                    <div
                                        key={i}
                                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${role.alive
                                                ? getRoleTypeStyle(role)
                                                : "opacity-50 bg-slate-100 border-slate-300"
                                            }`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                                            {/* Player Info */}
                                            <div className="flex items-center space-x-3 md:w-48">
                                                <div
                                                    className={`w-3 h-3 rounded-full ${role.alive ? "bg-green-400" : "bg-red-400"
                                                        }`}
                                                ></div>
                                                <div>
                                                    <div
                                                        className={`font-semibold ${role.alive ? "" : "line-through"
                                                            }`}
                                                    >
                                                        {(playerNames[i] as Player)?.name || `Player ${i + 1}`}
                                                    </div>
                                                    <div className="text-sm font-medium capitalize">
                                                        {role.allotedRole}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Alive/Dead Toggle */}
                                            <button
                                                onClick={() => {
                                                    dispatch(
                                                        updateAllocation([
                                                            ...allocation.slice(0, i),
                                                            { ...role, alive: !role.alive },
                                                            ...allocation.slice(i + 1),
                                                        ])
                                                    );
                                                }}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${role.alive
                                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                                        : "bg-red-600 hover:bg-red-700 text-white"
                                                    }`}
                                            >
                                                <FontAwesomeIcon
                                                    icon={role.alive ? faCheckCircle : faBan}
                                                />
                                                <span>{role.alive ? "Alive" : "Dead"}</span>
                                            </button>

                                            {/* Webhook Input */}
                                            <div className="flex-grow flex space-x-2">
                                                <input
                                                    type="url"
                                                    className="input-field flex-grow"
                                                    placeholder={`Webhook URL for ${(playerNames[i] as Player)?.name || `Player ${i + 1}`
                                                        }`}
                                                    value={(playerNames[i] as Player)?.hook || ""}
                                                    onChange={(e) => {
                                                        dispatch(
                                                            updatePlayers([
                                                                ...playerNames.slice(0, i),
                                                                {
                                                                    ...((playerNames[i] as Player) || { name: "", hook: "" }),
                                                                    hook: e.target.value
                                                                },
                                                                ...playerNames.slice(i + 1),
                                                            ])
                                                        );
                                                    }}
                                                />
                                                <button
                                                    onClick={() => sendWebhook(i, role)}
                                                    disabled={!isValidUrl((playerNames[i] as Player)?.hook || "")}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${isValidUrl((playerNames[i] as Player)?.hook || "")
                                                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                            : "bg-slate-300 text-slate-500 cursor-not-allowed"
                                                        }`}
                                                >
                                                    <FontAwesomeIcon icon={faPaperPlane} />
                                                    <span className="hidden sm:inline">Send</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {allocation.length === 0 && (
                                <div className="text-center py-12 text-slate-500">
                                    <FontAwesomeIcon icon={faUsers} className="text-4xl mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">No Game Active</h3>
                                    <p className="mb-4">
                                        Start by creating a game with roles and players
                                    </p>
                                    <button
                                        onClick={() => router.push("/")}
                                        className="btn-primary"
                                    >
                                        Create Game
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
