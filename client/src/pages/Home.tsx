import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { Upload, Search, FileSpreadsheet, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              ORCID Manager
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Gestión de ORCIDs para Investigadores
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sube tu archivo Excel, busca automáticamente los ORCIDs de tus investigadores,
            revisa casos ambiguos y exporta los resultados.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>1. Subir Excel</CardTitle>
              <CardDescription>
                Carga tu archivo con la lista de investigadores
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>2. Búsqueda Automática</CardTitle>
              <CardDescription>
                El sistema busca ORCIDs usando múltiples estrategias
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>3. Revisión Manual</CardTitle>
              <CardDescription>
                Revisa y decide en casos con 0 o múltiples resultados
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>4. Exportar</CardTitle>
              <CardDescription>
                Descarga el Excel con todos los ORCIDs encontrados
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Link href="/upload">
              <Button size="lg" className="text-lg px-8 py-6">
                <Upload className="mr-2 h-5 w-5" />
                Formato Completo
              </Button>
            </Link>
            <Link href="/upload-simple">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <FileSpreadsheet className="mr-2 h-5 w-5" />
                Formato Simplificado
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Elige el formato que coincida con tu archivo Excel
          </p>
          <div className="mt-4">
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Ver Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>ORCID Manager - Gestión eficiente de identificadores de investigadores</p>
        </div>
      </footer>
    </div>
  );
}
