import { Bus, CheckCircle, ChevronDown, ChevronUp, Clock, FileText, MapPin, User, XCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Approval, ApprovalStatus, getApprovals, HalfDayDetails, processApproval, RouteChangeDetails } from '../../services/api-rest';

type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

export default function ApprovalsScreen() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [filter, setFilter] = useState<FilterType>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{ visible: boolean; approval: Approval | null; action: 'approve' | 'reject' | null }>({
    visible: false, approval: null, action: null,
  });
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadApprovals();
  }, [filter]);

  const loadApprovals = async () => {
    setIsLoading(true);
    try {
      const response = await getApprovals({ status: filter === 'all' ? undefined : filter as ApprovalStatus });
      if (response.success && response.data) {
        setApprovals(response.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionModal.approval || !actionModal.action) return;
    
    setProcessing(true);
    try {
      const response = await processApproval({
        approvalId: actionModal.approval.id,
        status: actionModal.action === 'approve' ? 'approved' : 'rejected',
        note: note,
      });
      
      if (response.success) {
        setActionModal({ visible: false, approval: null, action: null });
        setNote('');
        loadApprovals();
      }
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending': return { bg: 'bg-amber-500/20', text: 'text-amber-500', icon: '#F59E0B' };
      case 'approved': return { bg: 'bg-green-500/20', text: 'text-green-500', icon: '#22C55E' };
      case 'rejected': return { bg: 'bg-red-500/20', text: 'text-red-500', icon: '#EF4444' };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'route_change': return 'Route Change';
      case 'half_day': return 'Half Day Leave';
      case 'temp_stop': return 'Temporary Stop';
      default: return type;
    }
  };

  const renderApprovalDetails = (approval: Approval) => {
    if (approval.type === 'route_change' || approval.type === 'temp_stop') {
      const details = approval.details as RouteChangeDetails;
      return (
        <View className="bg-secondary/50 rounded-lg p-3 mt-3">
          <View className="flex-row items-center mb-2">
            <Bus size={14} color="#71717A" />
            <Text className="text-sm text-muted-foreground ml-2">
              Bus Change: {details.originalBusId} → {details.newBusId}
            </Text>
          </View>
          <View className="flex-row items-center mb-2">
            <MapPin size={14} color="#71717A" />
            <Text className="text-sm text-muted-foreground ml-2">
              Stop: {details.originalStopId} → {details.newStopId}
            </Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Clock size={14} color="#71717A" />
            <Text className="text-sm text-muted-foreground ml-2">
              Date: {details.date} • {details.isPermanent ? 'Permanent' : 'One-time'}
            </Text>
          </View>
          <View className="flex-row items-start">
            <FileText size={14} color="#71717A" />
            <Text className="text-sm text-muted-foreground ml-2 flex-1">
              Reason: {details.reason}
            </Text>
          </View>
        </View>
      );
    } else if (approval.type === 'half_day') {
      const details = approval.details as HalfDayDetails;
      return (
        <View className="bg-secondary/50 rounded-lg p-3 mt-3">
          <View className="flex-row items-center mb-2">
            <Clock size={14} color="#71717A" />
            <Text className="text-sm text-muted-foreground ml-2">
              Pickup: {details.pickupTime} on {details.date}
            </Text>
          </View>
          <View className="flex-row items-center mb-2">
            <User size={14} color="#71717A" />
            <Text className="text-sm text-muted-foreground ml-2">
              Pickup By: {details.pickupBy}
            </Text>
          </View>
          <View className="flex-row items-start">
            <FileText size={14} color="#71717A" />
            <Text className="text-sm text-muted-foreground ml-2 flex-1">
              Reason: {details.reason}
            </Text>
          </View>
        </View>
      );
    }
    return null;
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-4 border-b border-border">
        <Text className="text-xl font-semibold text-foreground">Approvals</Text>
        <Text className="text-sm text-muted-foreground">Review and manage requests</Text>
      </View>

      {/* Filters */}
      <View className="flex-row px-4 mb-4 gap-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3" >
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              className={`mr-2 px-4 py-2 rounded-full ${filter === f.key ? 'bg-primary' : 'bg-secondary'}` }
            >
              <Text className={`text-sm font-medium ${filter === f.key ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#22C55E" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4">
          {approvals.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <CheckCircle size={48} color="#71717A" />
              <Text className="text-lg font-medium text-foreground mt-4">No {filter} approvals</Text>
              <Text className="text-sm text-muted-foreground">All caught up!</Text>
            </View>
          ) : (
            approvals.map((approval) => {
              const statusStyle = getStatusColor(approval.status);
              const isExpanded = expandedId === approval.id;
              
              return (
                <TouchableOpacity
                  key={approval.id}
                  onPress={() => setExpandedId(isExpanded ? null : approval.id)}
                  className="bg-card rounded-xl p-4 mb-3"
                >
                  {/* Header */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className={`w-10 h-10 ${statusStyle.bg} rounded-full items-center justify-center mr-3`}>
                        <User size={20} color={statusStyle.icon} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          {approval.student?.name || 'Student'}
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          {getTypeLabel(approval.type)}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <View className={`${statusStyle.bg} px-2 py-1 rounded-full mr-2`}>
                        <Text className={`text-xs font-medium ${statusStyle.text}`}>
                          {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                        </Text>
                      </View>
                      {isExpanded ? <ChevronUp size={18} color="#71717A" /> : <ChevronDown size={18} color="#71717A" />}
                    </View>
                  </View>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <>
                      {renderApprovalDetails(approval)}
                      
                      {/* Action Buttons */}
                      {approval.status === 'pending' && (
                        <View className="flex-row mt-4 gap-3">
                          <TouchableOpacity
                            className="flex-1 bg-green-500/20 border border-green-500/50 py-3 rounded-xl flex-row items-center justify-center"
                            onPress={() => setActionModal({ visible: true, approval, action: 'approve' })}
                          >
                            <CheckCircle size={18} color="#22C55E" />
                            <Text className="text-green-500 font-semibold ml-2">Approve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="flex-1 bg-red-500/20 border border-red-500/50 py-3 rounded-xl flex-row items-center justify-center"
                            onPress={() => setActionModal({ visible: true, approval, action: 'reject' })}
                          >
                            <XCircle size={18} color="#EF4444" />
                            <Text className="text-red-500 font-semibold ml-2">Reject</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Processed Info */}
                      {approval.status !== 'pending' && approval.processedAt && (
                        <View className="mt-3 pt-3 border-t border-border">
                          <Text className="text-xs text-muted-foreground">
                            {approval.status === 'approved' ? 'Approved' : 'Rejected'} on {new Date(approval.processedAt).toLocaleDateString()}
                          </Text>
                          {approval.note && (
                            <Text className="text-xs text-muted-foreground mt-1">Note: {approval.note}</Text>
                          )}
                        </View>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Action Modal */}
      <Modal visible={actionModal.visible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-card rounded-t-3xl p-6">
            <Text className="text-xl font-semibold text-foreground mb-2">
              {actionModal.action === 'approve' ? 'Approve Request' : 'Reject Request'}
            </Text>
            <Text className="text-sm text-muted-foreground mb-4">
              {actionModal.action === 'approve'
                ? 'This will notify the office admin and update student records.'
                : 'Please provide a reason for rejection.'}
            </Text>

            <Text className="text-sm font-medium text-foreground mb-2">Note (optional)</Text>
            <TextInput
              className="bg-secondary text-foreground rounded-xl p-4 mb-6"
              placeholder="Add a note..."
              placeholderTextColor="#71717A"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-secondary py-4 rounded-xl items-center"
                onPress={() => {
                  setActionModal({ visible: false, approval: null, action: null });
                  setNote('');
                }}
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-4 rounded-xl items-center ${actionModal.action === 'approve' ? 'bg-green-500' : 'bg-red-500'}`}
                onPress={handleAction}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-semibold">
                    {actionModal.action === 'approve' ? 'Approve' : 'Reject'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}