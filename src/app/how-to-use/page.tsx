'use client';
import React from 'react';
import NavigationLinks from '@/components/NavigationLinks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGamepad,
    faUsers,
    faClock,
    faVoteYea,
    faEye,
    faMoon,
    faSun,
    faCheckCircle,
    faTimesCircle,
    faInfoCircle,
    faPlayCircle,
    faStepForward,
} from '@fortawesome/free-solid-svg-icons';

export default function HowToUsePage() {
    return (
        <>
            <NavigationLinks />
            <div className="pt-20 p-6 min-h-screen mt-10">
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4 text-shadow">
                            📜 Game Rules
                        </h1>
                        <p className="text-lg text-slate-700 max-w-2xl mx-auto">
                            Master the classic Mafia party game with these simple rules and strategies
                        </p>
                    </div>

                    {/* Quick Overview */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                <FontAwesomeIcon icon={faInfoCircle} className="mr-3 text-blue-600" />
                                Game Overview
                            </h2>
                        </div>
                        <div className="card-body">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <FontAwesomeIcon icon={faUsers} className="text-3xl text-blue-600 mb-3" />
                                    <h3 className="font-semibold text-slate-900 mb-2">5+ Players</h3>
                                    <p className="text-sm text-slate-600">Minimum 5 players required for a balanced game</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                                    <FontAwesomeIcon icon={faClock} className="text-3xl text-green-600 mb-3" />
                                    <h3 className="font-semibold text-slate-900 mb-2">30-60 Minutes</h3>
                                    <p className="text-sm text-slate-600">Game duration depends on players and discussion</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                                    <FontAwesomeIcon icon={faGamepad} className="text-3xl text-purple-600 mb-3" />
                                    <h3 className="font-semibold text-slate-900 mb-2">Social Deduction</h3>
                                    <p className="text-sm text-slate-600">Bluffing, deduction, and strategic voting</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Game Setup */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                <FontAwesomeIcon icon={faPlayCircle} className="mr-3 text-green-600" />
                                Game Setup
                            </h2>
                        </div>
                        <div className="card-body space-y-4">
                            <div className="flex items-start space-x-4">
                                <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Choose Roles</h3>
                                    <p className="text-slate-600">Select roles for your game. A typical setup includes 2 Mafia, 3 Villagers, 1 Police, and 1 Doctor for 7 players.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Add Player Names</h3>
                                    <p className="text-slate-600">Enter the names of all players participating in the game.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Generate & Distribute Roles</h3>
                                    <p className="text-slate-600">Click &quot;Generate &amp; Start Game!&quot; to randomly assign roles. Share each player&apos;s role privately.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    4
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Begin the Game</h3>
                                    <p className="text-slate-600">Start with the first night phase. The narrator guides the game flow.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Game Phases */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Night Phase */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                                    <FontAwesomeIcon icon={faMoon} className="mr-3 text-indigo-600" />
                                    Night Phase
                                </h2>
                            </div>
                            <div className="card-body space-y-4">
                                <p className="text-slate-600">
                                    During night, all players close their eyes. Special roles act in secret.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            M
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Mafia</h4>
                                            <p className="text-sm text-slate-600">Choose a player to eliminate</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            P
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Police</h4>
                                            <p className="text-sm text-slate-600">Investigate one player&apos;s role</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            D
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Doctor</h4>
                                            <p className="text-sm text-slate-600">Protect one player from elimination</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Day Phase */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                                    <FontAwesomeIcon icon={faSun} className="mr-3 text-yellow-600" />
                                    Day Phase
                                </h2>
                            </div>
                            <div className="card-body space-y-4">
                                <p className="text-slate-600">
                                    All players wake up and discuss who they think is mafia.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <FontAwesomeIcon icon={faEye} className="text-yellow-600 mt-1" />
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Reveal Results</h4>
                                            <p className="text-sm text-slate-600">Narrator announces what happened during the night</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <FontAwesomeIcon icon={faUsers} className="text-yellow-600 mt-1" />
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Discussion</h4>
                                            <p className="text-sm text-slate-600">Players discuss and share suspicions</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <FontAwesomeIcon icon={faVoteYea} className="text-yellow-600 mt-1" />
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Voting</h4>
                                            <p className="text-sm text-slate-600">Vote to eliminate a suspected mafia member</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Win Conditions */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                <FontAwesomeIcon icon={faCheckCircle} className="mr-3 text-green-600" />
                                How to Win
                            </h2>
                        </div>
                        <div className="card-body">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                    <div className="flex items-center mb-3">
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-2" />
                                        <h3 className="font-semibold text-green-800">Villagers Win</h3>
                                    </div>
                                    <p className="text-sm text-green-700">
                                        Eliminate all mafia members through voting during day phases.
                                    </p>
                                </div>
                                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                                    <div className="flex items-center mb-3">
                                        <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 mr-2" />
                                        <h3 className="font-semibold text-red-800">Mafia Wins</h3>
                                    </div>
                                    <p className="text-sm text-red-700">
                                        Eliminate enough villagers to equal or outnumber the remaining villagers.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tips for Success */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                <FontAwesomeIcon icon={faStepForward} className="mr-3 text-purple-600" />
                                Tips for Success
                            </h2>
                        </div>
                        <div className="card-body">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-green-500 mb-3">For Villagers:</h3>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li className="flex items-start">
                                            <span className="text-green-600 mr-2">•</span>
                                            Pay attention to voting patterns and behavior
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-600 mr-2">•</span>
                                            Share information with other villagers
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-600 mr-2">•</span>
                                            Trust but verify claims from other players
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-600 mr-2">•</span>
                                            Use special role information wisely
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-3 text-red-700">For Mafia:</h3>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li className="flex items-start">
                                            <span className="text-red-600 mr-2">•</span>
                                            Blend in and act like a villager
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-red-600 mr-2">•</span>
                                            Coordinate with other mafia members
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-red-600 mr-2">•</span>
                                            Create confusion and misdirect suspicion
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-red-600 mr-2">•</span>
                                            Target threatening villagers at night
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
