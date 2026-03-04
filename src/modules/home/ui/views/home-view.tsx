"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    FileText, 
    Package, 
    Users, 
    TrendingUp, 
    Clock, 
    CheckCircle, 
    AlertCircle,
    Plus,
    ArrowRight,
    BarChart3,
    Globe,
    DollarSign,
    Activity,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getDashboardStats, getRecentActivity } from "../../server/actions";

export const HomeView = () => {
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [stats, setStats] = useState<any>(null);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            const [statsResult, activityResult] = await Promise.all([
                getDashboardStats(),
                getRecentActivity()
            ]);

            if (statsResult.success) {
                setStats(statsResult.data);
            }

            if (activityResult.success && activityResult.data) {
                setRecentActivity(activityResult.data);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des données:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        { 
            title: 'Dossiers', 
            description: 'Créer un nouveau dossier de transit',
            icon: FileText,
            color: 'bg-blue-500 hover:bg-blue-600',
            action: () => router.push('/dossiers')
        },
        // { 
        //     title: 'Import Colisages', 
        //     description: 'Importer des colisages depuis Excel',
        //     icon: Package,
        //     color: 'bg-emerald-500 hover:bg-emerald-600',
        //     action: () => router.push('/colisage')
        // },
        { 
            title: 'Clients', 
            description: 'Ajouter un nouveau client',
            icon: Users,
            color: 'bg-violet-500 hover:bg-violet-600',
            action: () => router.push('/client')
        },
        { 
            title: 'Conversion Devise', 
            description: 'Créer une nouvelle conversion',
            icon: DollarSign,
            color: 'bg-amber-500 hover:bg-amber-600',
            action: () => router.push('/conversion')
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            {/* Header avec salutation */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Bienvenue sur SFX Pre-Douane
                        </h1>
                        <p className="text-lg text-gray-600">
                            Tableau de bord - {currentTime.toLocaleDateString('fr-FR', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-mono text-blue-600">
                            {currentTime.toLocaleTimeString('fr-FR')}
                        </div>
                        <Badge variant="outline" className="mt-2">
                            <Activity className="w-3 h-3 mr-1" />
                            Système opérationnel
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 cursor-pointer">
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" onClick={() => router.push('/dossiers')}>
                        <CardTitle className="text-sm font-medium opacity-90">Dossiers</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <FileText className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm opacity-90">Chargement...</span>
                            </div>
                        ) : (
                            <>
                                <div className="text-3xl font-bold mb-1">{stats?.dossiers?.total || 0}</div>
                                <p className="text-xs opacity-80">
                                    {stats?.dossiers?.enCours || 0} en cours • {stats?.dossiers?.termines || 0} terminés
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">Colisages</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Package className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm opacity-90">Chargement...</span>
                            </div>
                        ) : (
                            <>
                                <div className="text-3xl font-bold mb-1">{stats?.colisages?.total || 0}</div>
                                <p className="text-xs opacity-80">
                                    Colisages importés dans le système
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0" onClick={() => router.push('/client')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">Clients</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Users className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm opacity-90">Chargement...</span>
                            </div>
                        ) : (
                            <>
                                <div className="text-3xl font-bold mb-1">{stats?.clients?.total || 0}</div>
                                <p className="text-xs opacity-80">
                                    {stats?.clients?.actifsCeMois || 0} nouveaux ce mois
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0" onClick={() => router.push('/conversion')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">Conversions</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm opacity-90">Chargement...</span>
                            </div>
                        ) : (
                            <>
                                <div className="text-3xl font-bold mb-1">{stats?.conversions?.total || 0}</div>
                                <p className="text-xs opacity-80">
                                    {stats?.conversions?.ceMois || 0} ce mois
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Actions rapides */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Actions Rapides
                            </CardTitle>
                            <CardDescription>
                                Accédez rapidement aux fonctionnalités principales
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quickActions.map((action, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        className="h-auto p-4 justify-start hover:shadow-md transition-all"
                                        onClick={action.action}
                                    >
                                        <div className={`p-2 rounded-md ${action.color} text-white mr-3`}>
                                            <action.icon className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium">{action.title}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {action.description}
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 ml-auto" />
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informations calculées */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Aperçu des Performances
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    <span>Calcul des performances...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {stats?.dossiers?.total > 0 ? 
                                                Math.round((stats.dossiers.termines / stats.dossiers.total) * 100) : 0}%
                                        </div>
                                        <div className="text-sm text-blue-700">Taux de completion</div>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                        <div className="text-2xl font-bold text-emerald-600">
                                            {stats?.colisages?.total || 0}
                                        </div>
                                        <div className="text-sm text-emerald-700">Colisages traités</div>
                                    </div>
                                    <div className="p-4 bg-violet-50 rounded-lg border border-violet-100 hover:bg-violet-100 transition-colors">
                                        <div className="text-2xl font-bold text-violet-600">
                                            {stats?.conversions?.ceMois || 0}
                                        </div>
                                        <div className="text-sm text-violet-700">Conversions ce mois</div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Activité récente */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Activité Récente
                            </CardTitle>
                            <CardDescription>
                                Dernières actions effectuées
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                                        <div className={`p-2 rounded-full ${
                                            activity.status === 'completed' ? 'bg-emerald-100 border border-emerald-200' : 
                                            activity.status === 'processing' ? 'bg-amber-100 border border-amber-200' : 'bg-slate-100 border border-slate-200'
                                        }`}>
                                            {activity.status === 'completed' ? (
                                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                            ) : activity.status === 'processing' ? (
                                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                            ) : (
                                                <Clock className="h-4 w-4 text-slate-600" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{activity.title}</div>
                                            <div className="text-xs text-gray-500">Il y a {activity.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informations système */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Informations Système
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Version</span>
                                <Badge variant="secondary">v2.1.0</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Environnement</span>
                                <Badge variant="outline">Production</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Dernière MAJ</span>
                                <span className="text-sm">12 Déc 2025</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
