import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, Eye, RefreshCw, Play, StopCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
  const { progress } = useSocket();
  const [concurrency, setConcurrency] = useState(5);
  
  const { data: sessions, isLoading, refetch } = trpc.upload.getSessions.useQuery();
  const { data: queueStatus, refetch: refetchQueueStatus } = trpc.search.getQueueStatus.useQuery();
  
  const startSearchMutation = trpc.search.startAutoSearch.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message + ` (${concurrency} workers en paralelo)`);
        // Refetch sessions to update counts
        setTimeout(() => refetch(), 1000);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error(`Error al iniciar búsqueda: ${error.message}`);
    },
  });
  
  // Refetch sessions when progress updates
  useEffect(() => {
    if (progress && progress.processed === progress.total) {
      // Search completed, refetch sessions
      setTimeout(() => {
        refetch();
        toast.success('Búsqueda automática completada');
      }, 1000);
    }
  }, [progress, refetch]);

  const stopSearchMutation = trpc.search.stopSearch.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
      refetchQueueStatus();
    },
    onError: (error) => {
      toast.error(`Error al detener búsqueda: ${error.message}`);
    },
  });

  const exportMutation = trpc.orcid.exportToExcel.useMutation({
    onSuccess: (data) => {
      // Download file
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${data.data}`;
      link.download = data.filename;
      link.click();
      toast.success("Archivo exportado exitosamente");
    },
    onError: (error) => {
      toast.error(`Error al exportar: ${error.message}`);
    },
  });



  const handleExport = () => {
    exportMutation.mutate({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
            <Button size="sm" onClick={handleExport} disabled={exportMutation.isPending}>
              <Download className="mr-2 h-4 w-4" />
              {exportMutation.isPending ? "Exportando..." : "Exportar Excel"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">
            Visualiza el progreso de tus búsquedas de ORCID
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando sesiones...</p>
          </div>
        ) : sessions && sessions.length > 0 ? (
          <div className="space-y-6">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{session.filename}</CardTitle>
                      <CardDescription>
                        Subido el {new Date(session.createdAt).toLocaleString('es-ES')}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge variant={
                        session.status === 'completed' ? 'default' :
                        session.status === 'processing' ? 'secondary' :
                        session.status === 'failed' ? 'destructive' : 'outline'
                      }>
                        {session.status === 'completed' ? 'Completado' :
                         session.status === 'processing' ? 'Procesando' :
                         session.status === 'failed' ? 'Fallido' : 'Subiendo'}
                      </Badge>
                      {session.totalResearchers > session.foundCount + session.multipleCount + session.notFoundCount && (
                        <div className="flex gap-2 items-center">
                          <div className="flex flex-col gap-1">
                            <Label htmlFor="concurrency" className="text-xs">Workers</Label>
                            <Input
                              id="concurrency"
                              type="number"
                              min="1"
                              max="20"
                              value={concurrency}
                              onChange={(e) => setConcurrency(parseInt(e.target.value) || 5)}
                              className="w-20 h-8 text-sm"
                              disabled={startSearchMutation.isPending}
                            />
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => startSearchMutation.mutate({ sessionId: session.id, concurrency })}
                            disabled={startSearchMutation.isPending || (queueStatus?.active || 0) > 0}
                            className="mt-5"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            {startSearchMutation.isPending ? 'Iniciando...' : 'Iniciar Búsqueda'}
                          </Button>
                          {(queueStatus?.active || 0) > 0 && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => stopSearchMutation.mutate()}
                              disabled={stopSearchMutation.isPending}
                              className="mt-5"
                            >
                              <StopCircle className="mr-2 h-4 w-4" />
                              {stopSearchMutation.isPending ? 'Deteniendo...' : 'Detener Búsqueda'}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {progress?.total || session.totalResearchers}
                      </div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {progress?.found || session.foundCount}
                      </div>
                      <div className="text-sm text-gray-600">Encontrados</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {progress?.multiple || session.multipleCount}
                      </div>
                      <div className="text-sm text-gray-600">Múltiples</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {progress?.notFound || session.notFoundCount}
                      </div>
                      <div className="text-sm text-gray-600">No encontrados</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {progress?.processed || session.processedCount}
                      </div>
                      <div className="text-sm text-gray-600">Procesados</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progreso</span>
                      <span>{Math.round((((progress?.processed || session.processedCount) || 0) / (progress?.total || session.totalResearchers)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(((progress?.processed || session.processedCount) || 0) / (progress?.total || session.totalResearchers)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Link href="/review">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Revisar Casos Pendientes
                      </Button>
                    </Link>
                    {(progress?.multiple || session.multipleCount) > 0 && (
                      <Link href="/multiple-results">
                        <Button variant="outline" size="sm">
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Ver Múltiples ({progress?.multiple || session.multipleCount})
                        </Button>
                      </Link>
                    )}
                    {(progress?.notFound || session.notFoundCount) > 0 && (
                      <Link href="/not-found-searches">
                        <Button variant="outline" size="sm">
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Ver No Encontrados ({progress?.notFound || session.notFoundCount})
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">No hay sesiones de carga aún</p>
              <Link href="/upload">
                <Button>
                  Subir Primer Archivo
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
