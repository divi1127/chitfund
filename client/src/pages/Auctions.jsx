import { useState, useEffect } from "react";
import { useData } from "../hooks/useData";
import { createData, updateData, deleteData, fetchData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { fmt } from "../utils/helpers";
import { HiPlay, HiReceiptRefund, HiPencil, HiTrash, HiUser } from "react-icons/hi2";
import { IconBtn } from "../components/IconBtn";
import { useAuth } from "../contexts/AuthContext";

export function Auctions({ toast, setPreview }) {
  const { user } = useAuth();
  const { data: auctions, loading } = useData('/auctions');
  const [refresh, setRefresh] = useState(0);
  const { data: groups } = useData('/groups');
  const { data: schemes } = useData('/schemes');
  const { data: members } = useData('/members');
  const [showForm, setShowForm] = useState(false);
  const [editingAuction, setEditingAuction] = useState(null);
  const [form, setForm] = useState({ groupId: "", date: "", installment: "", baseAmount: "" });
  const [errors, setErrors] = useState({});
  const [conductingAuction, setConductingAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [winner, setWinner] = useState(null);
  const [selectedWinnerId, setSelectedWinnerId] = useState("");
  const [groupDetails, setGroupDetails] = useState(null);

  const isSuperAdmin = user?.role === "super_admin";

  const groupById = (id) => groups.find((g) => g.id === id);
  const schemeById = (id) => schemes.find((s) => s.id === id);
  const memberByGroupMemberId = (memberId) => members.find((m) => m.id === memberId || m.memberId === memberId);

  useEffect(() => {
    if (form.groupId) {
      fetchData(`/auctions/group/${form.groupId}`).then(data => {
        setGroupDetails(data);
        if (!editingAuction) {
          setForm(prev => ({
            ...prev,
            baseAmount: data.auctionAmount || '',
            installment: data.group?.currentInstallment || ''
          }));
        }
      }).catch(() => setGroupDetails(null));
    } else {
      setGroupDetails(null);
    }
  }, [form.groupId]);

  useEffect(() => {
    if (conductingAuction) {
      fetchData(`/auctions/group/${conductingAuction.groupId}`).then(data => {
        setGroupDetails(data);
        if (data.auctionAmount) {
          setBidAmount(String(data.auctionAmount));
        }
      }).catch(() => setGroupDetails(null));
    }
  }, [conductingAuction]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.groupId) newErrors.groupId = "Group is required";
    if (!form.date) newErrors.date = "Date is required";
    if (!form.installment || isNaN(form.installment) || Number(form.installment) <= 0) newErrors.installment = "Valid installment number is required";
    if (!form.baseAmount || isNaN(form.baseAmount) || Number(form.baseAmount) <= 0) newErrors.baseAmount = "Valid base amount is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const auctionData = {
        ...form,
        id: editingAuction ? editingAuction.id : "A" + Date.now().toString().slice(-6),
        baseAmount: Number(form.baseAmount),
        installment: Number(form.installment),
        status: "Scheduled",
        winningBid: editingAuction ? editingAuction.winningBid : null,
        winnerId: editingAuction ? editingAuction.winnerId : null
      };

      if (editingAuction) {
        await updateData('/auctions', editingAuction.id, auctionData);
        toast.add("Auction updated successfully!");
      } else {
        await createData('/auctions', auctionData);
        toast.add("Auction scheduled successfully!");
      }
      
      setShowForm(false);
      setEditingAuction(null);
      setForm({ groupId: "", date: "", installment: "", baseAmount: "" });
      setErrors({});
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error saving auction: " + error.message, "error");
    }
  };

  const handleEdit = (auction) => {
    setEditingAuction(auction);
    setForm({
      groupId: auction.groupId,
      date: auction.date?.split('T')[0],
      installment: auction.installment,
      baseAmount: auction.baseAmount
    });
    setShowForm(true);
  };

  const handleDelete = async (auctionId) => {
    if (!confirm("Are you sure you want to delete this auction?")) return;
    try {
      await deleteData('/auctions', auctionId);
      toast.add("Auction deleted successfully!");
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error deleting auction: " + error.message, "error");
    }
  };

  const handleConductAuction = (auction) => {
    setConductingAuction(auction);
    setBidAmount("");
    setWinner(null);
    setSelectedWinnerId("");
  };

  const handlePlaceBid = () => {
    if (!bidAmount || isNaN(bidAmount) || Number(bidAmount) <= 0) {
      toast.add("Please enter a valid bid amount", "error");
      return;
    }
    setWinner({ bidAmount: Number(bidAmount) });
    toast.add("Bid placed successfully! Select the winning member.");
  };

  const handleCompleteAuction = async () => {
    if (!winner) {
      toast.add("Please place a winning bid first", "error");
      return;
    }
    if (!selectedWinnerId) {
      toast.add("Please select the winning member", "error");
      return;
    }
    
    try {
      await updateData('/auctions', conductingAuction.id, {
        ...conductingAuction,
        status: "Completed",
        winningBid: winner.bidAmount,
        winnerId: selectedWinnerId
      });
      toast.add("Auction completed successfully!");
      setConductingAuction(null);
      setWinner(null);
      setBidAmount("");
      setSelectedWinnerId("");
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error completing auction: " + error.message, "error");
    }
  };

  const handleGenerateReceipt = (auction) => {
    const g = groupById(auction.groupId);
    const s = g ? schemeById(g.schemeId) : null;
    const winnerMember = memberByGroupMemberId(auction.winnerId);
    setPreview({
      title: "Auction Receipt",
      docNo: auction.conductId || "AUC" + auction.id,
      chit: { "Group": g?.name, "Scheme": s?.name, "Installment": "#" + auction.installment, "Base Amount": fmt(auction.baseAmount), "Winning Bid": fmt(auction.winningBid || 0), "Winner": winnerMember?.name || auction.winnerId },
      payments: {
        headers: ["Description", "Amount"],
        rows: [["Base Amount", fmt(auction.baseAmount)], ["Winning Bid", fmt(auction.winningBid || 0)], ["Discount", fmt(auction.baseAmount - (auction.winningBid || 0))]]
      },
      amount: auction.winningBid || auction.baseAmount,
      notes: auction.status === "Completed" ? `Auction completed. Winner: ${winnerMember?.name || auction.winnerId}` : "Auction receipt."
    });
  };

  const groupMembers = conductingAuction
    ? (groupById(conductingAuction.groupId)?.members || []).map(memberId => memberByGroupMemberId(memberId)).filter(Boolean)
    : [];

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="Auction Management" subtitle="Schedule and conduct chit auctions"
        actions={isSuperAdmin ? [<Btn key="a" label="+ Schedule Auction" onClick={() => { setEditingAuction(null); setForm({ groupId: "", date: "", installment: "", baseAmount: "" }); setShowForm(true); }} primary />] : []} />

      {showForm && isSuperAdmin && (
        <div style={{ background: "var(--bg-card-alt)", border: "var(--border-color)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>{editingAuction ? "Edit Auction" : "Schedule Auction"}</div>
          {groupDetails && (
            <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Scheme: <strong>{groupDetails.scheme?.name}</strong></div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Members: <strong>{groupDetails.members?.length}</strong></div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Auction Amount: <strong>{fmt(groupDetails.auctionAmount)}</strong></div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 20px" }}>
            <div>
              <Input label="Group *" value={form.groupId} onChange={v => setForm({ ...form, groupId: v })} options={groups.map(g => ({ value: g.id, label: g.name }))} />
              {errors.groupId && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.groupId}</div>}
            </div>
            <div>
              <Input label="Auction Date *" value={form.date} onChange={v => setForm({ ...form, date: v })} type="date" />
              {errors.date && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.date}</div>}
            </div>
            <div>
              <Input label="Installment No *" value={form.installment} onChange={v => setForm({ ...form, installment: v })} type="number" />
              {errors.installment && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.installment}</div>}
            </div>
            <div>
              <Input label="Base Amount (₹) *" value={form.baseAmount} onChange={v => setForm({ ...form, baseAmount: v })} type="number" />
              {errors.baseAmount && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.baseAmount}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn label={editingAuction ? "Update Auction" : "Schedule Auction"} onClick={handleSubmit} primary />
            <Btn label="Cancel" onClick={() => { setShowForm(false); setEditingAuction(null); setForm({ groupId: "", date: "", installment: "", baseAmount: "" }); setErrors({}); }} />
          </div>
        </div>
      )}

      {conductingAuction && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 12, padding: 24, maxWidth: 520, width: "90%" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Conduct Auction - {groupById(conductingAuction.groupId)?.name}</div>
            {groupDetails && (
              <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Scheme: <strong>{groupDetails.scheme?.name}</strong></div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Members: <strong>{groupDetails.members?.length}</strong></div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Monthly: <strong>{fmt(groupDetails.scheme?.monthlyInstallment)}</strong></div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Installment: <strong>#{groupDetails.group?.currentInstallment}</strong></div>
              </div>
            )}
            <div style={{ marginBottom: 16, fontSize: 13, color: "var(--text-muted)" }}>Base Amount: {fmt(conductingAuction.baseAmount)}</div>
            
            {!winner && (
              <div>
                <Input label="Enter Bid Amount" value={bidAmount} onChange={setBidAmount} type="number" />
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <Btn label="Place Bid" onClick={handlePlaceBid} primary />
                  <Btn label="Cancel" onClick={() => { setConductingAuction(null); setBidAmount(""); }} />
                </div>
              </div>
            )}

            {winner && (
              <div>
                <div style={{ padding: 16, background: "var(--bg-card-alt)", borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>Winning Bid</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#16a34a" }}>{fmt(winner.bidAmount)}</div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Select Winning Member *</div>
                  <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: 8 }}>
                    {groupMembers.map((m, i) => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedWinnerId(m.userId)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                          cursor: "pointer", background: selectedWinnerId === m.userId ? "rgba(37,99,235,0.1)" : "transparent",
                          borderBottom: i < groupMembers.length - 1 ? "1px solid var(--border-color)" : "none", transition: "all .15s ease"
                        }}
                      >
                        <HiUser size={16} color={selectedWinnerId === m.userId ? "#2563eb" : "var(--text-muted)"} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>ID: {m.userId}</div>
                        </div>
                        {selectedWinnerId === m.userId && (
                          <div style={{ marginLeft: "auto", color: "#2563eb", fontSize: 11, fontWeight: 600 }}>Selected</div>
                        )}
                      </div>
                    ))}
                  </div>
                  {groupMembers.length === 0 && (
                    <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No members found in this group.</div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <Btn label="Complete Auction" onClick={handleCompleteAuction} primary />
                  <Btn label="Cancel" onClick={() => { setConductingAuction(null); setWinner(null); setBidAmount(""); setSelectedWinnerId(""); }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Table cols={["Conduct ID", "Group", "Date", "Installment", "Base Amount", "Winning Bid", "Winner", "Status", "Actions"]}
        rows={(() => {
          // Build combined list: existing auctions + active groups without auctions
          const activeGroups = groups.filter(g => g.status === 'Active' && g.schemeId);
          const auctionGroupIds = new Set(auctions.map(a => a.groupId));
          const pendingGroups = activeGroups.filter(g => !auctionGroupIds.has(g.id) && g.members?.length > 0);

          const pendingRows = pendingGroups.map(g => {
            const s = schemeById(g.schemeId);
            const baseAmt = s?.auctionAmount || s?.amount || 0;
            return [
              <span key={g.id + 'cid'} style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>,
              g.name,
              <span key={g.id + 'date'} style={{ color: "var(--text-muted)", fontSize: 12 }}>Not scheduled</span>,
              "#" + (g.currentInstallment || 1),
              fmt(baseAmt), "—", "—",
              <Badge key={g.id + 'st'} text="Ready" color="orange" />,
              <div key={g.id + 'act'} style={{ display: "flex", gap: 6 }}>
                {isSuperAdmin && <IconBtn icon={<HiPlay size={14} />} onClick={async () => {
                  const s = schemeById(g.schemeId);
                  const baseAmt = s?.auctionAmount || s?.amount || 0;
                  try {
                    const newAuction = await createData('/auctions', {
                      id: "A" + Date.now().toString().slice(-6),
                      groupId: g.id,
                      date: new Date().toISOString(),
                      installment: g.currentInstallment || 1,
                      baseAmount: baseAmt,
                      status: "Scheduled"
                    });
                    setConductingAuction(newAuction);
                    setBidAmount(String(baseAmt));
                    setWinner(null);
                    setSelectedWinnerId("");
                    setRefresh(r => r + 1);
                  } catch (e) {
                    toast.add("Error creating auction: " + e.message, "error");
                  }
                }} color="#d97706" title="Conduct" />}
              </div>
            ];
          });

          const auctionRows = auctions.map(a => {
            const g = groupById(a.groupId);
            const winnerMember = memberByGroupMemberId(a.winnerId);
            return [a.conductId || "—", g?.name, a.date?.split('T')[0], "#" + a.installment, fmt(a.baseAmount), fmt(a.winningBid || 0),
              a.winnerId ? `${winnerMember?.name || ""} (${a.winnerId})` : "—",
              <Badge key={a.id} text={a.status} color={a.status === "Completed" ? "green" : a.status === "Scheduled" ? "blue" : "yellow"} />,
              <div key={a.id} style={{ display: "flex", gap: 6 }}>
                {a.status === "Scheduled" && isSuperAdmin && <IconBtn icon={<HiPlay size={14} />} onClick={() => handleConductAuction(a)} color="#d97706" title="Conduct" />}
                <IconBtn icon={<HiReceiptRefund size={14} />} onClick={() => handleGenerateReceipt(a)} color="#7c3aed" title="Receipt" />
                {isSuperAdmin && <IconBtn icon={<HiPencil size={14} />} onClick={() => handleEdit(a)} color="#2563eb" title="Edit" />}
                {isSuperAdmin && <IconBtn icon={<HiTrash size={14} />} onClick={() => handleDelete(a.id)} color="#dc2626" title="Delete" />}
              </div>
            ];
          });

          return [...pendingRows, ...auctionRows];
        })()} />
    </div>
  );
}
