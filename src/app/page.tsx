'use client';
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/redux/store";
import {
  updateMafia,
  updateVillage,
  updatePlayers,
  updateAllocation,
  showAlert,
} from "@/redux/store";

import {
  faPlus,
  faMinus,
  faChevronRight,
  faInfoCircle,
  faUsers,
  faPlay,
  faGamepad,
  faUserFriends,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import roleDescriptions from "../roleDescriptions.json";
import NavigationLinks from "@/components/NavigationLinks";

//Shuffle an array (stackoverflow)
function shuffle(a: any[]) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = ~~(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

// Predefined friends list - you can customize this with your actual friends' names
const predefinedFriends = [
  "Alex",
  "Amy",
  "Anna",
  "Chris",
  "Daniel",
  "David",
  "Emma",
  "Jessica",
  "John",
  "Kate",
  "Kevin",
  "Laura",
  "Lisa",
  "Mark",
  "Maria",
  "Megan",
  "Mike",
  "Paul",
  "Rachel",
  "Ryan",
  "Sarah",
  "Sophie",
  "Steve",
  "Tom",
];

export default function GameDesignPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  // State for friend selection
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const mafiaRoles = useSelector((state: RootState) => state.game.mafiaRoles);
  const villageRoles = useSelector((state: RootState) => state.game.villageRoles);
  const playerNames = useSelector((state: RootState) => state.game.playerNames);

  const mafiaCount = Object.values(mafiaRoles).reduce(
    (sum, value) => sum + value,
    0
  );
  const villagerCount = Object.values(villageRoles).reduce(
    (sum, value) => sum + value,
    0
  );
  const players = mafiaCount + villagerCount;

  const allRoles = { ...mafiaRoles, ...villageRoles };

  const availableRoles = Object.entries(allRoles)
    .filter(([, count]) => count > 0)
    .reduce((roleArray: string[], [role, count]) => {
      for (let i = 0; i < count; i++) roleArray.push(role);
      return roleArray;
    }, []);

  const uniqueAvailableRoles = [...new Set(availableRoles)];

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerNames.length !== players)
      dispatch(showAlert({ body: "Enter all player names or remove roles", header: "Error" }));
    else if (players < 5)
      dispatch(showAlert({ body: "Need minimum of 5 players.", header: "Error" }));
    else if (players === 0) 
      dispatch(showAlert({ body: "Add some roles", header: "Error" }));
    else {
      // Shuffle
      let shuffledRoles = shuffle([...availableRoles]);

      let allotedRoles = [];
      // allocate randomly (Second shuffle)
      for (let i = 0; i < players; i++) {
        const countRolesLeft = shuffledRoles.length;
        const random = Math.random();
        const allotedRoleIndex = ~~(random * countRolesLeft);
        const allotedRole = shuffledRoles[allotedRoleIndex];

        allotedRoles.push({
          alive: true,
          allotedRole,
          type: (roleDescriptions as any)[allotedRole].type,
        });
        shuffledRoles.splice(allotedRoleIndex, 1);
      }
      dispatch(updateAllocation(allotedRoles));
      router.push("/game");
    }
  };

  const handleSelectFriends = () => {
    if (selectedFriends.length === players) {
      // Use selected friends
      const autoFilledPlayers = selectedFriends.map((friendName, i) => ({
        name: friendName,
        hook: (playerNames[i] as any)?.hook || "",
      }));
      dispatch(updatePlayers(autoFilledPlayers));
      setShowFriendSelector(false);
    } else {
      // Toggle friend selector
      setShowFriendSelector(!showFriendSelector);
    }
  };

  const handleFriendToggle = (friendName: string) => {
    setSelectedFriends((prev) => {
      if (prev.includes(friendName)) {
        return prev.filter((name) => name !== friendName);
      } else if (prev.length < players) {
        return [...prev, friendName];
      }
      return prev;
    });
  };

  const getRoleTypeStyle = (type: string) => {
    switch (type) {
      case "M":
        return "role-mafia";
      case "V":
        return "role-village";
      case "N":
        return "role-neutral";
      default:
        return "";
    }
  };

  const roleDisplay = (roleObject: any, roleUpdateFn: any) =>
    Object.entries(roleObject).map(([role, count]: [string, any]) => (
      <div
        key={role}
        className={`role-card role-card-hover ${getRoleTypeStyle(
          (roleDescriptions as any)[role].type
        )}`}
      >
        <div className="flex items-center justify-between">
          <div
            className="flex-grow cursor-pointer py-2"
            onClick={() => {
              const { type, description, player, narrator } =
                (roleDescriptions as any)[role];

              dispatch(
                showAlert({
                  body: (
                    <div className="space-y-2">
                      <p>
                        <strong>Type:</strong> {type}
                      </p>
                      <p>
                        <strong>Description:</strong> {description}
                      </p>
                      {player && (
                        <p>
                          <strong>Player notes:</strong> {player}
                        </p>
                      )}
                      {narrator && (
                        <p>
                          <strong>Narrator notes:</strong> {narrator}
                        </p>
                      )}
                    </div>
                  ),
                  header: `Role: ${role}`,
                })
              );
            }}
          >
            <span className="font-medium capitalize">{role}</span>
            <FontAwesomeIcon
              icon={faInfoCircle}
              className="ml-2 text-slate-400 text-xs"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              className={`p-1 rounded hover:bg-slate-200 transition-colors ${
                count === 0 ? "text-slate-400" : "text-slate-600"
              }`}
              onClick={() => {
                if (count !== 0) {
                  dispatch(
                    roleUpdateFn({
                      ...roleObject,
                      [role]: count - 1,
                    })
                  );
                }
              }}
              disabled={count === 0}
            >
              <FontAwesomeIcon icon={faMinus} />
            </button>
            <span
              className={`text-center w-8 font-medium ${
                count === 0
                  ? "text-slate-400"
                  : (roleDescriptions as any)[role].type === "M"
                  ? "text-red-600"
                  : (roleDescriptions as any)[role].type === "V"
                  ? "text-green-600"
                  : "text-yellow-600"
              }`}
            >
              {count}
            </span>
            <button
              className="p-1 rounded hover:bg-slate-200 transition-colors text-slate-600"
              onClick={() => {
                dispatch(
                  roleUpdateFn({
                    ...roleObject,
                    [role]: count + 1,
                  })
                );
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>
      </div>
    ));

  return (
    <>
      <NavigationLinks />
      <div className="pt-20 p-6 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 text-shadow">
              🎭 Mafia Party
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Create a thrilling Mafia game by selecting roles and adding players.
              Perfect for virtual game nights and gatherings!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Roles Section */}
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                    <FontAwesomeIcon icon={faUsers} className="mr-3 text-red-600" />
                    Mafia Roles
                    <span className="ml-auto bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                      {mafiaCount}
                    </span>
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Click roles for details
                  </p>
                </div>
                <div className="card-body space-y-3">
                  {roleDisplay(mafiaRoles, updateMafia)}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                    <FontAwesomeIcon
                      icon={faUsers}
                      className="mr-3 text-green-600"
                    />
                    Village Roles
                    <span className="ml-auto bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                      {villagerCount}
                    </span>
                  </h2>
                </div>
                <div className="card-body space-y-3">
                  {roleDisplay(villageRoles, updateVillage)}
                </div>
              </div>
            </div>

            {/* Players Section */}
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                    <FontAwesomeIcon
                      icon={faGamepad}
                      className="mr-3 text-primary-600"
                    />
                    Players
                    <span className="ml-auto bg-primary-100 text-primary-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                      {players}
                    </span>
                  </h2>
                </div>
                <div className="card-body">
                  <form onSubmit={handleAllocate} className="space-y-4">
                    {/* Friend Selection */}
                    {players >= 5 && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 mb-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              Quick Setup
                            </p>
                            <p className="text-xs text-slate-500">
                              Select {players} friends for this game
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowFriendSelector(true)}
                            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md text-sm"
                          >
                            <FontAwesomeIcon
                              icon={faUserFriends}
                              className="text-blue-600 text-sm"
                            />
                            <span className="text-slate-700">Select Friends</span>
                            <FontAwesomeIcon
                              icon={faChevronRight}
                              className="text-slate-400 text-xs"
                            />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Helper message for minimum players */}
                    {players > 0 && players < 5 && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200 mb-6">
                        <div className="flex items-center space-x-3">
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="text-yellow-600"
                          />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              Add More Roles
                            </p>
                            <p className="text-xs text-yellow-700">
                              You need at least 5 players to start a game. Add{" "}
                              {5 - players} more role{5 - players !== 1 ? "s" : ""}.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Friend Selection Modal */}
                    {showFriendSelector && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
                          {/* Modal Header */}
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                            <div className="flex justify-between items-center">
                              <div>
                                <h2 className="text-xl font-bold">
                                  Choose Your Friends
                                </h2>
                                <p className="text-blue-100 text-sm">
                                  Select {players} friends for this game
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowFriendSelector(false)}
                                className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                              >
                                <FontAwesomeIcon
                                  icon={faTimes}
                                  className="text-white text-xl"
                                />
                              </button>
                            </div>
                          </div>

                          {/* Modal Body */}
                          <div className="p-6">
                            {/* Progress indicator */}
                            <div className="mb-6">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-600">
                                  Progress
                                </span>
                                <span className="text-sm font-semibold text-blue-600">
                                  {selectedFriends.length} / {players} selected
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${
                                      (selectedFriends.length / players) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* Friends Grid */}
                            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto mb-6 pr-2">
                              {predefinedFriends.map((friend) => (
                                <button
                                  key={friend}
                                  type="button"
                                  onClick={() => handleFriendToggle(friend)}
                                  disabled={
                                    !selectedFriends.includes(friend) &&
                                    selectedFriends.length >= players
                                  }
                                  className={`p-4 rounded-xl text-center font-medium transition-all duration-200 ${
                                    selectedFriends.includes(friend)
                                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg"
                                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:shadow-sm"
                                  } ${
                                    !selectedFriends.includes(friend) &&
                                    selectedFriends.length >= players
                                      ? "opacity-40 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <div className="flex flex-col items-center space-y-2">
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                                        selectedFriends.includes(friend)
                                          ? "bg-white bg-opacity-20 text-white"
                                          : "bg-blue-100 text-blue-600"
                                      }`}
                                    >
                                      {friend.charAt(0)}
                                    </div>
                                    <span className="text-sm">{friend}</span>
                                  </div>
                                </button>
                              ))}
                            </div>

                            {/* Helper text */}
                            {selectedFriends.length < players && (
                              <div className="text-center mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-700">
                                  <FontAwesomeIcon
                                    icon={faInfoCircle}
                                    className="mr-2"
                                  />
                                  Select {players - selectedFriends.length} more
                                  friend
                                  {players - selectedFriends.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                  to continue
                                </p>
                              </div>
                            )}

                            {selectedFriends.length === players && (
                              <div className="text-center mb-6 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                <p className="text-sm text-emerald-700">
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    className="mr-2"
                                  />
                                  Perfect! You've selected all {players} friends
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Modal Footer */}
                          <div className="bg-slate-50 px-6 py-4 flex space-x-3 justify-end">
                            <button
                              type="button"
                              onClick={() => setShowFriendSelector(false)}
                              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors text-sm"
                            >
                              Cancel
                            </button>
                            {selectedFriends.length === players && (
                              <button
                                type="button"
                                onClick={handleSelectFriends}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm"
                              >
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className="text-sm"
                                />
                                <span>Use These Friends</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Player Name Inputs */}
                    {Array.from({ length: Math.max(players, 5) }, (_, i) => (
                      <input
                        key={i}
                        required
                        type="text"
                        className={`input-field ${
                          i >= players ? "opacity-50" : ""
                        }`}
                        placeholder={`Player ${i + 1} name`}
                        value={playerNames[i] ? (playerNames[i] as any).name : ""}
                        disabled={i >= players}
                        onChange={(e) => {
                          if (i < players) {
                            dispatch(
                              updatePlayers([
                                ...playerNames.slice(0, i),
                                { ...(playerNames[i] as any), name: e.target.value },
                                ...playerNames.slice(i + 1),
                              ])
                            );
                          }
                        }}
                      />
                    ))}

                    <div className="space-y-3 pt-4">
                      <button
                        type="submit"
                        className="w-full btn-primary flex items-center justify-center space-x-2"
                      >
                        <FontAwesomeIcon icon={faPlay} />
                        <span>Generate & Start Game!</span>
                      </button>

                      <button
                        type="button"
                        className="w-full btn-secondary flex items-center justify-center space-x-2"
                        onClick={() => router.push("/game")}
                      >
                        <FontAwesomeIcon icon={faChevronRight} />
                        <span>View Current Game</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Narrator Notes Section */}
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="mr-3 text-purple-600"
                    />
                    Narrator Notes
                  </h2>
                </div>
                <div className="card-body">
                  {uniqueAvailableRoles.filter(
                    (role) => (roleDescriptions as any)[role].narrator !== ""
                  ).length > 0 ? (
                    <div className="space-y-4">
                      {uniqueAvailableRoles
                        .filter((role) => (roleDescriptions as any)[role].narrator !== "")
                        .map((role, i) => (
                          <div
                            key={i}
                            className="p-3 bg-purple-50 rounded-lg border border-purple-200"
                          >
                            <h4 className="font-semibold text-purple-900 capitalize mb-1">
                              {role}
                            </h4>
                            <p className="text-sm text-purple-700">
                              {(roleDescriptions as any)[role].narrator}
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className="text-4xl mb-3"
                      />
                      <p>
                        Select roles with special narrator instructions to see them
                        here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
