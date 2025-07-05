/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import DashboardLayout from '../components/DashboardLayout';
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Textarea,
  Spacer,
  Progress,
  Badge,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure
} from '@heroui/react';
import { 
  MapPin, 
  Plus, 
  Search, 
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface Field {
  id: string;
  name: string;
  location: string;
  area: number; // hectares
  plantingDate: string;
  treeCount: number;
  lastAnalysis: string;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  yieldTrend: 'up' | 'down' | 'stable';
  soilPH: number;
  avgYield: number; // tons per hectare
  coordinates: {
    lat: number;
    lng: number;
  };
  notes?: string;
}

export default function FieldsPage() {
  const [fields, setFields] = useState<Field[]>([
    {
      id: '1',
      name: 'North Block A',
      location: 'Selangor, Malaysia',
      area: 25.5,
      plantingDate: '2018-03-15',
      treeCount: 1275,
      lastAnalysis: '2024-01-15',
      healthStatus: 'good',
      yieldTrend: 'up',
      soilPH: 6.2,
      avgYield: 18.5,
      coordinates: { lat: 3.1390, lng: 101.6869 },
      notes: 'Recently applied fertilizer. Monitor nitrogen levels.'
    },
    {
      id: '2',
      name: 'South Block B',
      location: 'Johor, Malaysia',
      area: 42.3,
      plantingDate: '2016-08-22',
      treeCount: 2115,
      lastAnalysis: '2024-01-10',
      healthStatus: 'excellent',
      yieldTrend: 'stable',
      soilPH: 5.8,
      avgYield: 22.1,
      coordinates: { lat: 1.4854, lng: 103.7618 },
      notes: 'High-performing field. Continue current management practices.'
    },
    {
      id: '3',
      name: 'East Block C',
      location: 'Pahang, Malaysia',
      area: 18.7,
      plantingDate: '2019-11-10',
      treeCount: 935,
      lastAnalysis: '2024-01-08',
      healthStatus: 'fair',
      yieldTrend: 'down',
      soilPH: 4.9,
      avgYield: 14.2,
      coordinates: { lat: 3.8126, lng: 103.3256 },
      notes: 'Soil pH below optimal range. Consider lime application.'
    },
    {
      id: '4',
      name: 'West Block D',
      location: 'Perak, Malaysia',
      area: 31.2,
      plantingDate: '2017-05-18',
      treeCount: 1560,
      lastAnalysis: '2024-01-12',
      healthStatus: 'poor',
      yieldTrend: 'down',
      soilPH: 7.1,
      avgYield: 12.8,
      coordinates: { lat: 4.2105, lng: 101.9758 },
      notes: 'High pH affecting nutrient uptake. Urgent intervention needed.'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [isEditFieldOpen, setIsEditFieldOpen] = useState(false);
  const [isViewFieldOpen, setIsViewFieldOpen] = useState(false);
  const [newField, setNewField] = useState<Partial<Field>>({});

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const filteredFields = fields.filter(field => {
    const matchesSearch = field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         field.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || field.healthStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'fair': return 'warning';
      case 'poor': return 'danger';
      case 'critical': return 'danger';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
      default: return null;
    }
  };

  const handleAddField = () => {
    if (newField.name && newField.location && newField.area) {
      const field: Field = {
        id: Date.now().toString(),
        name: newField.name,
        location: newField.location,
        area: newField.area,
        plantingDate: newField.plantingDate || new Date().toISOString().split('T')[0],
        treeCount: newField.treeCount || 0,
        lastAnalysis: new Date().toISOString().split('T')[0],
        healthStatus: newField.healthStatus || 'fair',
        yieldTrend: newField.yieldTrend || 'stable',
        soilPH: newField.soilPH || 6.0,
        avgYield: newField.avgYield || 0,
        coordinates: newField.coordinates || { lat: 0, lng: 0 },
        notes: newField.notes || ''
      };
      setFields([...fields, field]);
      setNewField({});
      setIsAddFieldOpen(false);
    }
  };

  const handleEditField = () => {
    if (selectedField && newField.name) {
      const updatedFields = fields.map(field => 
        field.id === selectedField.id ? { ...field, ...newField } : field
      );
      setFields(updatedFields);
      setNewField({});
      setSelectedField(null);
      setIsEditFieldOpen(false);
    }
  };

  const handleDeleteField = () => {
    if (selectedField) {
      setFields(fields.filter(field => field.id !== selectedField.id));
      setSelectedField(null);
      onDeleteClose();
    }
  };

  const openEditModal = (field: Field) => {
    setSelectedField(field);
    setNewField(field);
    setIsEditFieldOpen(true);
  };

  const openViewModal = (field: Field) => {
    setSelectedField(field);
    setIsViewFieldOpen(true);
  };

  const openDeleteModal = (field: Field) => {
    setSelectedField(field);
    onDeleteOpen();
  };

  const getTotalStats = () => {
    return {
      totalFields: fields.length,
      totalArea: fields.reduce((sum, field) => sum + field.area, 0),
      totalTrees: fields.reduce((sum, field) => sum + field.treeCount, 0),
      avgYield: fields.reduce((sum, field) => sum + field.avgYield, 0) / fields.length
    };
  };

  const stats = getTotalStats();

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Field Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor and manage your oil palm plantation fields
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalFields}</div>
              <div className="text-sm text-gray-600">Total Fields</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-success">{stats.totalArea.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Hectares</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-warning">{stats.totalTrees.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Palm Trees</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-secondary">{stats.avgYield.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Avg Yield (t/ha)</div>
            </CardBody>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Search fields by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<Search className="w-4 h-4" />}
            className="flex-1"
          />
          <Select
            placeholder="Filter by status"
            selectedKeys={statusFilter ? [statusFilter] : []}
            onSelectionChange={(keys) => {
              const status = Array.from(keys)[0] as string;
              setStatusFilter(status || 'all');
            }}
            className="w-48"
          >
            <SelectItem key="all">All Status</SelectItem>
            <SelectItem key="excellent">Excellent</SelectItem>
            <SelectItem key="good">Good</SelectItem>
            <SelectItem key="fair">Fair</SelectItem>
            <SelectItem key="poor">Poor</SelectItem>
            <SelectItem key="critical">Critical</SelectItem>
          </Select>
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={() => setIsAddFieldOpen(true)}
          >
            Add Field
          </Button>
        </div>

        {/* Fields Table */}
        <Card>
          <CardBody>
            <Table aria-label="Fields table">
              <TableHeader>
                <TableColumn>Field Name</TableColumn>
                <TableColumn>Location</TableColumn>
                <TableColumn>Area (ha)</TableColumn>
                <TableColumn>Trees</TableColumn>
                <TableColumn>Health Status</TableColumn>
                <TableColumn>Yield Trend</TableColumn>
                <TableColumn>Last Analysis</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredFields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{field.name}</div>
                        <div className="text-sm text-gray-500">pH: {field.soilPH}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {field.location}
                      </div>
                    </TableCell>
                    <TableCell>{field.area}</TableCell>
                    <TableCell>{field.treeCount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        color={getHealthStatusColor(field.healthStatus) as any}
                        size="sm"
                        variant="flat"
                      >
                        {field.healthStatus}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(field.yieldTrend)}
                        <span className="text-sm">{field.avgYield} t/ha</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(field.lastAnalysis).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="view"
                            startContent={<Eye className="w-4 h-4" />}
                            onPress={() => openViewModal(field)}
                          >
                            View Details
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Edit className="w-4 h-4" />}
                            onPress={() => openEditModal(field)}
                          >
                            Edit Field
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Trash2 className="w-4 h-4" />}
                            onPress={() => openDeleteModal(field)}
                          >
                            Delete Field
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Add Field Modal */}
        <Modal 
          isOpen={isAddFieldOpen} 
          onClose={() => {
            setIsAddFieldOpen(false);
            setNewField({});
          }}
          size="2xl"
        >
          <ModalContent>
            <ModalHeader>Add New Field</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Field Name"
                  placeholder="Enter field name"
                  value={newField.name || ''}
                  onChange={(e) => setNewField({...newField, name: e.target.value})}
                />
                <Input
                  label="Location"
                  placeholder="Enter location"
                  value={newField.location || ''}
                  onChange={(e) => setNewField({...newField, location: e.target.value})}
                />
                <Input
                  label="Area (hectares)"
                  type="number"
                  placeholder="0"
                  value={newField.area?.toString() || ''}
                  onChange={(e) => setNewField({...newField, area: parseFloat(e.target.value)})}
                />
                <Input
                  label="Tree Count"
                  type="number"
                  placeholder="0"
                  value={newField.treeCount?.toString() || ''}
                  onChange={(e) => setNewField({...newField, treeCount: parseInt(e.target.value)})}
                />
                <Input
                  label="Planting Date"
                  type="date"
                  value={newField.plantingDate || ''}
                  onChange={(e) => setNewField({...newField, plantingDate: e.target.value})}
                />
                <Select
                  label="Health Status"
                  placeholder="Select status"
                  selectedKeys={newField.healthStatus ? [newField.healthStatus] : []}
                  onSelectionChange={(keys) => {
                    const status = Array.from(keys)[0] as string;
                    setNewField({...newField, healthStatus: status as any});
                  }}
                >
                  <SelectItem key="excellent">Excellent</SelectItem>
                  <SelectItem key="good">Good</SelectItem>
                  <SelectItem key="fair">Fair</SelectItem>
                  <SelectItem key="poor">Poor</SelectItem>
                  <SelectItem key="critical">Critical</SelectItem>
                </Select>
              </div>
              <Textarea
                label="Notes"
                placeholder="Add any additional notes..."
                value={newField.notes || ''}
                onChange={(e) => setNewField({...newField, notes: e.target.value})}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => {
                setIsAddFieldOpen(false);
                setNewField({});
              }}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleAddField}>
                Add Field
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Field Modal */}
        <Modal 
          isOpen={isEditFieldOpen} 
          onClose={() => {
            setIsEditFieldOpen(false);
            setNewField({});
            setSelectedField(null);
          }}
          size="2xl"
        >
          <ModalContent>
            <ModalHeader>Edit Field</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Field Name"
                  placeholder="Enter field name"
                  value={newField.name || ''}
                  onChange={(e) => setNewField({...newField, name: e.target.value})}
                />
                <Input
                  label="Location"
                  placeholder="Enter location"
                  value={newField.location || ''}
                  onChange={(e) => setNewField({...newField, location: e.target.value})}
                />
                <Input
                  label="Area (hectares)"
                  type="number"
                  placeholder="0"
                  value={newField.area?.toString() || ''}
                  onChange={(e) => setNewField({...newField, area: parseFloat(e.target.value)})}
                />
                <Input
                  label="Tree Count"
                  type="number"
                  placeholder="0"
                  value={newField.treeCount?.toString() || ''}
                  onChange={(e) => setNewField({...newField, treeCount: parseInt(e.target.value)})}
                />
                <Input
                  label="Soil pH"
                  type="number"
                  step="0.1"
                  placeholder="6.0"
                  value={newField.soilPH?.toString() || ''}
                  onChange={(e) => setNewField({...newField, soilPH: parseFloat(e.target.value)})}
                />
                <Select
                  label="Health Status"
                  placeholder="Select status"
                  selectedKeys={newField.healthStatus ? [newField.healthStatus] : []}
                  onSelectionChange={(keys) => {
                    const status = Array.from(keys)[0] as string;
                    setNewField({...newField, healthStatus: status as any});
                  }}
                >
                  <SelectItem key="excellent">Excellent</SelectItem>
                  <SelectItem key="good">Good</SelectItem>
                  <SelectItem key="fair">Fair</SelectItem>
                  <SelectItem key="poor">Poor</SelectItem>
                  <SelectItem key="critical">Critical</SelectItem>
                </Select>
              </div>
              <Textarea
                label="Notes"
                placeholder="Add any additional notes..."
                value={newField.notes || ''}
                onChange={(e) => setNewField({...newField, notes: e.target.value})}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => {
                setIsEditFieldOpen(false);
                setNewField({});
                setSelectedField(null);
              }}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleEditField}>
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Field Modal */}
        <Modal 
          isOpen={isViewFieldOpen} 
          onClose={() => {
            setIsViewFieldOpen(false);
            setSelectedField(null);
          }}
          size="3xl"
        >
          <ModalContent>
            <ModalHeader>Field Details: {selectedField?.name}</ModalHeader>
            <ModalBody>
              {selectedField && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-semibold">Basic Information</h3>
                      </CardHeader>
                      <CardBody className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{selectedField.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Area:</span>
                          <span className="font-medium">{selectedField.area} hectares</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tree Count:</span>
                          <span className="font-medium">{selectedField.treeCount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Planting Date:</span>
                          <span className="font-medium">{new Date(selectedField.plantingDate).toLocaleDateString()}</span>
                        </div>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-semibold">Performance Metrics</h3>
                      </CardHeader>
                      <CardBody className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Health Status:</span>
                          <Chip
                            color={getHealthStatusColor(selectedField.healthStatus) as any}
                            size="sm"
                            variant="flat"
                          >
                            {selectedField.healthStatus}
                          </Chip>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Yield Trend:</span>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(selectedField.yieldTrend)}
                            <span className="font-medium">{selectedField.avgYield} t/ha</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Soil pH:</span>
                          <span className="font-medium">{selectedField.soilPH}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Analysis:</span>
                          <span className="font-medium">{new Date(selectedField.lastAnalysis).toLocaleDateString()}</span>
                        </div>
                      </CardBody>
                    </Card>
                  </div>

                  {selectedField.notes && (
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-semibold">Notes</h3>
                      </CardHeader>
                      <CardBody>
                        <p className="text-gray-700 dark:text-gray-300">{selectedField.notes}</p>
                      </CardBody>
                    </Card>
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button 
                color="primary" 
                onPress={() => {
                  setIsViewFieldOpen(false);
                  setSelectedField(null);
                }}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalContent>
            <ModalHeader>Confirm Deletion</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to delete the field &quot;{selectedField?.name}&quot;? This action cannot be undone.</p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onDeleteClose}>
                Cancel
              </Button>
              <Button color="danger" onPress={handleDeleteField}>
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
