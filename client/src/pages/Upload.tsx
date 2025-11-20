import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Upload as UploadIcon, FileSpreadsheet, ArrowLeft } from "lucide-react";
import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Upload() {
  const [, setLocation] = useLocation();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.upload.processExcel.useMutation({
    onSuccess: (data) => {
      toast.success(`Archivo procesado: ${data.totalResearchers} investigadores encontrados`);
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(`Error al procesar archivo: ${error.message}`);
      setUploading(false);
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error("Por favor selecciona un archivo Excel (.xlsx o .xls)");
      return;
    }

    setUploading(true);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const fileData = base64.split(',')[1]; // Remove data:application/... prefix

        uploadMutation.mutate({
          fileData,
          filename: file.name,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Error al leer el archivo");
      setUploading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Subir Archivo Excel
            </h1>
            <p className="text-lg text-gray-600">
              Sube tu archivo con la lista de investigadores para comenzar la búsqueda de ORCIDs
            </p>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Formato del Archivo</CardTitle>
              <CardDescription>
                El archivo Excel debe contener las siguientes columnas:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                  <span><strong>First Name</strong> (requerido): Nombre del investigador</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                  <span><strong>Last Name</strong> (requerido): Apellido del investigador</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                  <span><strong>Institution</strong> (opcional): Institución del investigador</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                  <span><strong>Email</strong> (opcional): Correo electrónico</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                  <span><strong>Country</strong> (opcional): País</span>
                </li>
              </ul>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                
                {uploading ? (
                  <div>
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-gray-700">Procesando archivo...</p>
                    <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos momentos</p>
                  </div>
                ) : (
                  <div>
                    <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Haz clic para seleccionar un archivo
                    </p>
                    <p className="text-sm text-gray-500">
                      o arrastra y suelta aquí
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Formatos soportados: .xlsx, .xls
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full"
                  size="lg"
                >
                  <UploadIcon className="mr-2 h-5 w-5" />
                  Seleccionar Archivo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
