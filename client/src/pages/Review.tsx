import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ExternalLink, Check, X } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function Review() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [selectedOrcid, setSelectedOrcid] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  
  const { data: needsReview, isLoading, refetch } = trpc.orcid.getNeedingReview.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateMutation = trpc.orcid.updateSearch.useMutation({
    onSuccess: () => {
      toast.success("Decisión guardada");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Requerido</CardTitle>
            <CardDescription>
              Debes iniciar sesión para revisar casos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Iniciar Sesión</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleApprove = (searchId: number, orcid?: string, status: 'found' | 'not_found' | 'manual' = 'manual') => {
    updateMutation.mutate({
      searchId,
      orcid: orcid || selectedOrcid[searchId],
      status,
      notes: notes[searchId],
    });
  };

  const handleReject = (searchId: number) => {
    updateMutation.mutate({
      searchId,
      status: 'not_found',
      notes: notes[searchId],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Revisión Manual</h1>
          <p className="text-lg text-gray-600">
            Revisa y decide sobre casos con 0 o múltiples resultados
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando casos...</p>
          </div>
        ) : needsReview && needsReview.length > 0 ? (
          <div className="space-y-6">
            {needsReview.map((item) => {
              const { search, researcher } = item;
              const multipleResults = search.multipleResults 
                ? JSON.parse(search.multipleResults) as string[]
                : [];

              return (
                <Card key={search.id} className="border-2">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl">
                          {researcher.firstName} {researcher.lastName}
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                          {researcher.institution && (
                            <span className="block">{researcher.institution}</span>
                          )}
                          {researcher.email && (
                            <span className="block text-sm">{researcher.email}</span>
                          )}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        search.status === 'multiple' ? 'secondary' :
                        search.status === 'not_found' ? 'destructive' : 'outline'
                      }>
                        {search.status === 'multiple' ? `${search.resultCount} Resultados` :
                         search.status === 'not_found' ? 'No Encontrado' : search.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Search URL */}
                    {search.searchUrl && (
                      <div className="mb-4">
                        <Label>URL de Búsqueda</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={search.searchUrl}
                            readOnly
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={search.searchUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Multiple Results */}
                    {search.status === 'multiple' && multipleResults.length > 0 && (
                      <div className="mb-4">
                        <Label>ORCIDs Encontrados</Label>
                        <div className="space-y-2 mt-2">
                          {multipleResults.map((orcid) => (
                            <div key={orcid} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`orcid-${search.id}`}
                                value={orcid}
                                checked={selectedOrcid[search.id] === orcid}
                                onChange={(e) => setSelectedOrcid({
                                  ...selectedOrcid,
                                  [search.id]: e.target.value
                                })}
                                className="w-4 h-4"
                              />
                              <Label className="flex-1 cursor-pointer">
                                {orcid}
                              </Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <a 
                                  href={`https://orcid.org/${orcid}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Manual ORCID Input */}
                    {search.status === 'not_found' && (
                      <div className="mb-4">
                        <Label>ORCID Manual (opcional)</Label>
                        <Input
                          placeholder="0000-0001-2345-6789"
                          value={selectedOrcid[search.id] || ''}
                          onChange={(e) => setSelectedOrcid({
                            ...selectedOrcid,
                            [search.id]: e.target.value
                          })}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Si encontraste el ORCID manualmente, ingrésalo aquí
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="mb-4">
                      <Label>Notas (opcional)</Label>
                      <Textarea
                        placeholder="Agrega notas sobre tu decisión..."
                        value={notes[search.id] || ''}
                        onChange={(e) => setNotes({
                          ...notes,
                          [search.id]: e.target.value
                        })}
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {search.status === 'multiple' && (
                        <Button
                          onClick={() => handleApprove(search.id, selectedOrcid[search.id], 'found')}
                          disabled={!selectedOrcid[search.id] || updateMutation.isPending}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Aprobar Selección
                        </Button>
                      )}
                      
                      {search.status === 'not_found' && selectedOrcid[search.id] && (
                        <Button
                          onClick={() => handleApprove(search.id, selectedOrcid[search.id], 'manual')}
                          disabled={updateMutation.isPending}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Guardar ORCID Manual
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        onClick={() => handleReject(search.id)}
                        disabled={updateMutation.isPending}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Marcar como No Encontrado
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">No hay casos pendientes de revisión</p>
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
