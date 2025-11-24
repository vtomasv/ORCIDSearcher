import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Edit, RefreshCw, ExternalLink, FileText, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function MultipleResults() {
  const { data: multipleSearches, isLoading, refetch } = trpc.orcid.getMultiple.useQuery();
  const [editingResearcher, setEditingResearcher] = useState<any>(null);
  const [viewingLogs, setViewingLogs] = useState<any>(null);
  const [viewingOrcids, setViewingOrcids] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    institution: "",
    email: "",
  });

  const selectOrcidMutation = trpc.orcid.selectOrcid.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setViewingOrcids(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const updateAndRequeueMutation = trpc.orcid.updateAndRequeue.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setEditingResearcher(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSelectOrcid = (searchId: number, orcid: string) => {
    selectOrcidMutation.mutate({ searchId, orcid });
  };

  const handleEdit = (researcher: any) => {
    setEditingResearcher(researcher);
    setFormData({
      firstName: researcher.firstName,
      lastName: researcher.lastName,
      institution: researcher.institution || "",
      email: researcher.email || "",
    });
  };

  const handleSubmit = () => {
    if (!editingResearcher) return;
    
    updateAndRequeueMutation.mutate({
      researcherId: editingResearcher.id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      institution: formData.institution,
      email: formData.email,
    });
  };

  const getMultipleOrcids = (search: any): string[] => {
    if (!search.debugInfo) return [];
    try {
      const debugInfo = JSON.parse(search.debugInfo);
      return debugInfo.multipleOrcids || [];
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Múltiples Resultados</h1>
          <p className="text-lg text-gray-600">
            Investigadores con múltiples ORCIDs encontrados. Selecciona el correcto o edita los datos para una búsqueda más precisa.
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">Cargando...</p>
            </CardContent>
          </Card>
        ) : !multipleSearches || multipleSearches.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">No hay investigadores con múltiples resultados</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Investigadores con Múltiples Resultados</CardTitle>
              <CardDescription>
                Total: {multipleSearches.length} investigadores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Apellido</TableHead>
                      <TableHead>Institución</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>URL de Búsqueda</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {multipleSearches.map((item: any) => {
                      const { search, researcher } = item;
                      const orcids = getMultipleOrcids(search);
                      
                      return (
                        <TableRow key={researcher.id}>
                          <TableCell>{researcher.firstName}</TableCell>
                          <TableCell>{researcher.lastName}</TableCell>
                          <TableCell>{researcher.institution || "-"}</TableCell>
                          <TableCell className="text-sm text-gray-600">{researcher.email || "-"}</TableCell>
                          <TableCell>
                            {search.searchUrl ? (
                              <a
                                href={search.searchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Ver búsqueda
                              </a>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog open={viewingOrcids?.id === researcher.id} onOpenChange={(open) => !open && setViewingOrcids(null)}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => setViewingOrcids({ ...item, orcids })}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Seleccionar ({orcids.length})
                                  </Button>
                                </DialogTrigger>
                              </Dialog>
                              
                              <Dialog open={editingResearcher?.id === researcher.id} onOpenChange={(open) => !open && setEditingResearcher(null)}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(researcher)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar y Re-encolar
                                  </Button>
                                </DialogTrigger>
                              </Dialog>
                              
                              <Dialog open={viewingLogs?.id === researcher.id} onOpenChange={(open) => !open && setViewingLogs(null)}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewingLogs(item)}
                                  >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Ver Logs
                                  </Button>
                                </DialogTrigger>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Dialog: Seleccionar ORCID */}
      {viewingOrcids && (
        <Dialog open={true} onOpenChange={() => setViewingOrcids(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Seleccionar ORCID Correcto</DialogTitle>
              <DialogDescription>
                {viewingOrcids.researcher.firstName} {viewingOrcids.researcher.lastName} - {viewingOrcids.researcher.institution}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600">
                Se encontraron {viewingOrcids.orcids.length} ORCIDs. Selecciona el correcto:
              </p>
              <div className="space-y-2">
                {viewingOrcids.orcids.map((orcid: string) => (
                  <div key={orcid} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">{orcid}</Badge>
                      <a
                        href={`https://orcid.org/${orcid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ver perfil
                      </a>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSelectOrcid(viewingOrcids.search.id, orcid)}
                      disabled={selectOrcidMutation.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Seleccionar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog: Editar y Re-encolar */}
      {editingResearcher && (
        <Dialog open={true} onOpenChange={() => setEditingResearcher(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Investigador</DialogTitle>
              <DialogDescription>
                Corrige los datos y re-encola para una nueva búsqueda
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution">Institución</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingResearcher(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={updateAndRequeueMutation.isPending}>
                {updateAndRequeueMutation.isPending ? "Guardando..." : "Guardar y Re-encolar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog: Ver Logs */}
      {viewingLogs && (
        <Dialog open={true} onOpenChange={() => setViewingLogs(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Logs de Debugging</DialogTitle>
              <DialogDescription>
                {viewingLogs.researcher.firstName} {viewingLogs.researcher.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-semibold mb-2">Debug Info (JSON)</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                  {viewingLogs.search.debugInfo || "No disponible"}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">HTML Snapshot (primeros 5000 caracteres)</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-96">
                  {viewingLogs.search.debugHtml || "No disponible"}
                </pre>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
