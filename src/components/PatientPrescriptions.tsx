import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FileText, Printer } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Prescription {
  id: string;
  doctorName: string;
  date: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  notes: string;
}

interface PatientPrescriptionsProps {
  prescriptions: Prescription[];
}

export default function PatientPrescriptions({ prescriptions }: PatientPrescriptionsProps) {
  const handlePrint = (prescription: Prescription) => {
    toast.success('Printing prescription...');
    // In a real app, this would trigger a print dialog
    window.print();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Prescriptions</CardTitle>
        <CardDescription>View and print your prescriptions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="size-12 mx-auto mb-4 opacity-50" />
              <p>No prescriptions available</p>
            </div>
          ) : (
            prescriptions.map(prescription => (
              <div key={prescription.id} className="p-6 border rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4>Dr. {prescription.doctorName}</h4>
                    <p className="text-muted-foreground">Date: {prescription.date}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handlePrint(prescription)}>
                    <Printer className="size-4 mr-2" />
                    Print
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4>Medications</h4>
                  {prescription.medications.map((med, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <p>{med.name}</p>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-muted-foreground">
                        <div>
                          <span>Dosage</span>
                          <p>{med.dosage}</p>
                        </div>
                        <div>
                          <span>Frequency</span>
                          <p>{med.frequency}</p>
                        </div>
                        <div>
                          <span>Duration</span>
                          <p>{med.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {prescription.notes && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-muted-foreground">Notes</p>
                    <p>{prescription.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
