import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Search, User, Calendar, FileText } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  visits: Array<{
    date: string;
    diagnosis: string;
    treatment: string;
    notes: string;
  }>;
  allergies: string[];
  conditions: string[];
}

interface PatientHistoryProps {
  patients: Patient[];
}

export default function PatientHistory({ patients }: PatientHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient History</CardTitle>
        <CardDescription>Track and review patient medical history</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {filteredPatients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <User className="size-12 mx-auto mb-4 opacity-50" />
            <p>No patients found</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {filteredPatients.map(patient => (
              <AccordionItem key={patient.id} value={patient.id} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 text-left">
                    <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="size-5 text-primary" />
                    </div>
                    <div>
                      <h4>{patient.name}</h4>
                      <p className="text-muted-foreground">
                        {patient.age} years • {patient.gender} • {patient.visits.length} visits
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {/* Medical Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-muted-foreground">Allergies</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.length > 0 ? (
                          patient.allergies.map((allergy, idx) => (
                            <Badge key={idx} variant="destructive">{allergy}</Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-muted-foreground">Conditions</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.conditions.length > 0 ? (
                          patient.conditions.map((condition, idx) => (
                            <Badge key={idx} variant="secondary">{condition}</Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Visit History */}
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      Visit History
                    </h4>
                    {patient.visits.map((visit, idx) => (
                      <div key={idx} className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <p>{visit.date}</p>
                          <Badge variant="outline">{visit.diagnosis}</Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Treatment</p>
                          <p>{visit.treatment}</p>
                        </div>
                        {visit.notes && (
                          <div>
                            <p className="text-muted-foreground">Notes</p>
                            <p>{visit.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
