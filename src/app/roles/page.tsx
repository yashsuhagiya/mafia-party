'use client';
import React, { useState, useEffect } from 'react';
import NavigationLinks from '@/components/NavigationLinks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faShield,
    faEye,
    faMask,
    faSearch,
    faFilter,
    faHeart,
    faBolt,
    faSkull,
    faMoon,
    faSun,
    faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import roleDescriptions from '@/roleDescriptions.json';

interface Role {
    name: string;
    type: string;
    description: string;
    player: string;
    narrator: string;
    team: string;
}

const getTeamColor = (team: string) => {
    switch (team.toLowerCase()) {
        case 'mafia':
            return 'bg-red-50 border-red-200 text-red-800';
        case 'villager':
            return 'bg-green-50 border-green-200 text-green-800';
        case 'neutral':
            return 'bg-yellow-50 border-yellow-200 text-yellow-800';
        default:
            return 'bg-gray-50 border-gray-200 text-gray-800';
    }
};

const getTeamIcon = (team: string) => {
    switch (team.toLowerCase()) {
        case 'mafia':
            return faSkull;
        case 'villager':
            return faShield;
        case 'neutral':
            return faQuestionCircle;
        default:
            return faUsers;
    }
};

const getRoleIcon = (roleName: string) => {
    const name = roleName.toLowerCase();
    if (name.includes('police') || name.includes('detective')) return faEye;
    if (name.includes('doctor') || name.includes('medic')) return faHeart;
    if (name.includes('mafia') || name.includes('killer')) return faSkull;
    if (name.includes('vigilante') || name.includes('hunter')) return faBolt;
    if (name.includes('jester') || name.includes('fool')) return faMask;
    return faUsers;
};

export default function RolesPage() {
    const [isHydrated, setIsHydrated] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('all');
    const [expandedRole, setExpandedRole] = useState<string | null>(null);

    // Fix hydration issue
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const roles: Role[] = Object.entries(roleDescriptions).map(([key, role]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize role names
        type: role.type,
        description: role.description,
        player: role.player,
        narrator: role.narrator,
        team: role.type === 'M' ? 'Mafia' : role.type === 'V' ? 'Villager' : 'Neutral',
    }));

    const teams = ['all', ...Array.from(new Set(roles.map(role => role.team.toLowerCase())))];

    const filteredRoles = roles.filter(role => {
        const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTeam = selectedTeam === 'all' || role.team.toLowerCase() === selectedTeam;
        return matchesSearch && matchesTeam;
    });

    const toggleExpanded = (roleName: string) => {
        setExpandedRole(expandedRole === roleName ? null : roleName);
    };

    // Prevent hydration mismatch
    if (!isHydrated) {
        return (
            <>
                <NavigationLinks />
                <div className="pt-20 p-6 min-h-screen">
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-slate-900 mb-4">
                                🎭 Mafia Roles Guide
                            </h1>
                            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
                                Discover all available roles, their abilities, and how they contribute to the game dynamics.
                            </p>
                        </div>
                        <div className="text-center text-slate-500">Loading...</div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <NavigationLinks />
            <div className="pt-20 p-6 min-h-screen">
                <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4 text-shadow">
                            🎭 Mafia Roles Guide
                        </h1>
                        <p className="text-lg text-slate-700 max-w-2xl mx-auto">
                            Discover all available roles, their abilities, and how they contribute to the game dynamics.
                        </p>
                    </div>

                    {/* Search and Filter */}
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FontAwesomeIcon
                                            icon={faSearch}
                                            className="text-slate-400"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search roles by name or description..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                                    />
                                </div>
                                <div className="relative min-w-[200px]">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FontAwesomeIcon
                                            icon={faFilter}
                                            className="text-slate-400"
                                        />
                                    </div>
                                    <select
                                        value={selectedTeam}
                                        onChange={(e) => setSelectedTeam(e.target.value)}
                                        className="w-full pl-12 pr-8 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm appearance-none cursor-pointer"
                                    >
                                        {teams.map(team => (
                                            <option key={team} value={team}>
                                                {team === 'all' ? 'All Teams' : team.charAt(0).toUpperCase() + team.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    {/* Custom dropdown arrow */}
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="card hover:shadow-lg transition-all duration-200 hover:scale-105">
                            <div className="card-body text-center p-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 flex-shrink-0">
                                    <FontAwesomeIcon icon={faUsers} className="text-xl text-blue-600" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 mb-1">{roles.length}</div>
                                <div className="text-sm text-slate-600 font-medium">Total Roles</div>
                            </div>
                        </div>
                        <div className="card hover:shadow-lg transition-all duration-200 hover:scale-105">
                            <div className="card-body text-center p-6">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 flex-shrink-0">
                                    <FontAwesomeIcon icon={faShield} className="text-xl text-green-600" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 mb-1">
                                    {roles.filter(r => r.team.toLowerCase() === 'villager').length}
                                </div>
                                <div className="text-sm text-slate-600 font-medium">Villager Roles</div>
                            </div>
                        </div>
                        <div className="card hover:shadow-lg transition-all duration-200 hover:scale-105">
                            <div className="card-body text-center p-6">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 flex-shrink-0">
                                    <FontAwesomeIcon icon={faSkull} className="text-xl text-red-600" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 mb-1">
                                    {roles.filter(r => r.team.toLowerCase() === 'mafia').length}
                                </div>
                                <div className="text-sm text-slate-600 font-medium">Mafia Roles</div>
                            </div>
                        </div>
                        <div className="card hover:shadow-lg transition-all duration-200 hover:scale-105">
                            <div className="card-body text-center p-6">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 flex-shrink-0">
                                    <FontAwesomeIcon icon={faQuestionCircle} className="text-xl text-yellow-600" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 mb-1">
                                    {roles.filter(r => r.team.toLowerCase() === 'neutral').length}
                                </div>
                                <div className="text-sm text-slate-600 font-medium">Neutral Roles</div>
                            </div>
                        </div>
                    </div>

                    {/* Results Count */}
                    {searchTerm || selectedTeam !== 'all' ? (
                        <div className="text-center">
                            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-800 rounded-full border border-blue-200">
                                <FontAwesomeIcon icon={faSearch} className="mr-2 text-sm" />
                                <span className="font-medium">
                                    Showing {filteredRoles.length} of {roles.length} roles
                                </span>
                            </div>
                        </div>
                    ) : null}

                    {/* Roles Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredRoles.map((role) => (
                            <div key={role.name} className="card hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                                <div
                                    className="card-header cursor-pointer hover:bg-slate-50 transition-colors duration-200"
                                    onClick={() => toggleExpanded(role.name)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                                                <FontAwesomeIcon
                                                    icon={getRoleIcon(role.name)}
                                                    className="text-blue-600 text-lg"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">{role.name}</h3>
                                                <div className="flex items-center space-x-2">
                                                    <FontAwesomeIcon
                                                        icon={getTeamIcon(role.team)}
                                                        className="text-sm flex-shrink-0"
                                                    />
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${getTeamColor(role.team)}`}>
                                                        {role.team}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-slate-400 text-xl font-light transition-transform duration-200 flex-shrink-0 ml-4">
                                            {expandedRole === role.name ? (
                                                <span className="transform rotate-45">+</span>
                                            ) : (
                                                <span>+</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <p className="text-slate-600 leading-relaxed">{role.description}</p>

                                    {expandedRole === role.name && (
                                        <div className="mt-6 pt-6 border-t border-slate-200 animate-fade-in">
                                            <div className="space-y-6">
                                                <div className="flex items-start space-x-4">
                                                    <div className="bg-blue-100 rounded-full p-3 flex-shrink-0 shadow-sm">
                                                        <FontAwesomeIcon icon={faEye} className="text-blue-600 text-sm" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-slate-900 mb-2 text-sm uppercase tracking-wide">Player Instructions</h4>
                                                        <p className="text-slate-600 whitespace-pre-line leading-relaxed">{role.player}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-4">
                                                    <div className="bg-purple-100 rounded-full p-3 flex-shrink-0 shadow-sm">
                                                        <FontAwesomeIcon icon={faUsers} className="text-purple-600 text-sm" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-slate-900 mb-2 text-sm uppercase tracking-wide">Narrator Instructions</h4>
                                                        <p className="text-slate-600 whitespace-pre-line leading-relaxed">{role.narrator}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* No Results */}
                    {filteredRoles.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FontAwesomeIcon icon={faSearch} className="text-4xl text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-semibold text-slate-900 mb-3">No roles found</h3>
                            <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                                Try adjusting your search terms or filters to find what you're looking for.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedTeam('all');
                                }}
                                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {/* Game Tips */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                <FontAwesomeIcon icon={faMoon} className="mr-3 text-indigo-600" />
                                Role Selection Tips
                            </h2>
                        </div>
                        <div className="card-body">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                                        <FontAwesomeIcon icon={faUsers} className="mr-2 text-blue-600" />
                                        For Small Groups (5-7 players):
                                    </h3>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li className="flex items-start">
                                            <span className="text-blue-600 mr-2">•</span>
                                            2 Mafia, 2-3 Villagers, 1 Police, 1 Doctor
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-blue-600 mr-2">•</span>
                                            Keep roles simple and balanced
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-blue-600 mr-2">•</span>
                                            Avoid too many special roles
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                                        <FontAwesomeIcon icon={faUsers} className="mr-2 text-green-600" />
                                        For Large Groups (8+ players):
                                    </h3>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li className="flex items-start">
                                            <span className="text-green-600 mr-2">•</span>
                                            3+ Mafia with special mafia roles
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-600 mr-2">•</span>
                                            Multiple villager power roles
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-600 mr-2">•</span>
                                            Consider adding neutral roles for complexity
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
