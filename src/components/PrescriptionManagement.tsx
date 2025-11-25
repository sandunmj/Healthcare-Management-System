import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { FileText, Printer, Edit, Plus, Trash2 } from 'lucide-react';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  medications: Medication[];
  notes: string;
}

interface PrescriptionManagementProps {
  prescriptions: Prescription[];
  onUpdate: (prescription: Prescription) => void;
}

export default function PrescriptionManagement({ prescriptions, onUpdate }: PrescriptionManagementProps) {
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription({ ...prescription });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingPrescription) {
      onUpdate(editingPrescription);
      toast.success('Prescription updated successfully');
      setIsDialogOpen(false);
      setEditingPrescription(null);
    }
  };

  const handlePrint = (prescription: Prescription) => {
    toast.success('Printing prescription...');
    window.print();
  };

  const addMedication = () => {
    if (editingPrescription) {
      setEditingPrescription({
        ...editingPrescription,
        medications: [
          ...editingPrescription.medications,
          { name: '', dosage: '', frequency: '', duration: '' }
        ]
      });
    }
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    if (editingPrescription) {
      const updatedMedications = [...editingPrescription.medications];
      updatedMedications[index] = { ...updatedMedications[index], [field]: value };
      setEditingPrescription({ ...editingPrescription, medications: updatedMedications });
    }
  };

  const removeMedication = (index: number) => {
    if (editingPrescription) {
      setEditingPrescription({
        ...editingPrescription,
        medications: editingPrescription.medications.filter((_, i) => i !== index)
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescription Management</CardTitle>
        <CardDescription>View, edit, and print patient prescriptions</CardDescription>
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
                    <h4>{prescription.patientName}</h4>
                    <p className="text-muted-foreground">Date: {prescription.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(prescription)}>
                      <Edit className="size-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePrint(prescription)}>
                      <Printer className="size-4 mr-2" />
                      Print
                    </Button>
                  </div>
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

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Prescription</DialogTitle>
              <DialogDescription>
                Update prescription details for {editingPrescription?.patientName}
              </DialogDescription>
            </DialogHeader>

            {editingPrescription && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4>Medications</h4>
                    <Button size="sm" onClick={addMedication}>
                      <Plus className="size-4 mr-2" />
                      Add Medication
                    </Button>
                  </div>

                  {editingPrescription.medications.map((med, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <h4>Medication {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedication(index)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Medication Name</Label>
                          <Input
                            value={med.name}
                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                            placeholder="e.g., Aspirin"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Dosage</Label>
                          <Input
                            value={med.dosage}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            placeholder="e.g., 100mg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Frequency</Label>
                          <Input
                            value={med.frequency}
                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                            placeholder="e.g., Twice daily"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duration</Label>
                          <Input
                            value={med.duration}
                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                            placeholder="e.g., 7 days"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={editingPrescription.notes}
                    onChange={(e) => setEditingPrescription({ ...editingPrescription, notes: e.target.value })}
                    placeholder="Additional notes or instructions..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
