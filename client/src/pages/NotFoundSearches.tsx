import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Edit, RefreshCw, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function NotFoundSearches() {
  const { data: notFoundSearches, isLoading, refetch } = trpc.orcid.getNotFound.useQuery();
  const [editingResearcher, setEditingResearcher] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    institution: "",
    email: "",
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">No Encontrados</h1>
          <p className="text-lg text-gray-600">
            Investigadores sin resultados en ORCID. Puedes corregir los datos y re-encolar para una nueva búsqueda.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando resultados...</p>
          </div>
        ) : notFoundSearches && notFoundSearches.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Investigadores No Encontrados ({notFoundSearches.length})</CardTitle>
              <CardDescription>
                Revisa los datos de búsqueda, corrige si es necesario y vuelve a intentar
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  {notFoundSearches.map(({ search, researcher }) => (
                    <TableRow key={researcher.id}>
                      <TableCell className="font-medium">{researcher.firstName}</TableCell>
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
                        <Dialog>
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
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Investigador</DialogTitle>
                              <DialogDescription>
                                Corrige los datos y el investigador será re-encolado para una nueva búsqueda
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="firstName">Nombre</Label>
                                <Input
                                  id="firstName"
                                  value={formData.firstName}
                                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="lastName">Apellido</Label>
                                <Input
                                  id="lastName"
                                  value={formData.lastName}
                                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="institution">Institución</Label>
                                <Input
                                  id="institution"
                                  value={formData.institution}
                                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                />
                              </div>
                              <div className="grid gap-2">
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
                              <Button
                                onClick={handleSubmit}
                                disabled={updateAndRequeueMutation.isPending}
                              >
                                {updateAndRequeueMutation.isPending ? "Guardando..." : "Guardar y Re-encolar"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">No hay investigadores sin resultados</p>
              <Link href="/dashboard">
                <Button>
                  Volver al Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
