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
  const [quickConduct, setQuickConduct] = useState(null);
  const [qcDate, setQcDate] = useState("");
  const [qcBidAmount, setQcBidAmount] = useState("");
  const [qcWinnerId, setQcWinnerId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedSchemeId, setSelectedSchemeId] = useState("");

  const isSuperAdmin = user?.role === "super_admin";
  const isUser = user?.role === "user";

  // User: only auctions for their group
  const userMember = isUser ? members.find(m => m.memberId === user.userId || m.email === user.email) : null;
  const userGroupIds = userMember?.groups || [];
  const visibleAuctions = isUser ? auctions.filter(a => a.winnerId === userMember?.userId || a.winnerId === userMember?.memberId) : auctions;

  const groupById = (id) => groups.find((g) => g.id === id);
  const schemeById = (id) => schemes.find((s) => s.id === id);
  const memberByGroupMemberId = (memberId) => members.find((m) => m.id === memberId || m.memberId === memberId);
  const selectedGroup = groupById(selectedGroupId);
  const selectedScheme = selectedSchemeId ? schemeById(selectedSchemeId) : (selectedGroup ? schemeById(selectedGroup.schemeId) : null);

  useEffect(() => {
    if (form.groupId) {
      fetchData(`/auctions/group/${form.groupId}`).then(data => {
        setGroupDetails(data);
        if (!editingAuction) {
          const installmentNo = data.group?.currentInstallment;
          const ma = data.scheme?.monthlyAmounts?.find(m => m.month === installmentNo);
          setForm(prev => ({
            ...prev,
            baseAmount: ma?.auctionAmount || data.auctionAmount || '',
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
        const installmentNo = conductingAuction.installment;
        const ma = data.scheme?.monthlyAmounts?.find(m => m.month === installmentNo);
        const bidAmt = ma?.auctionAmount || data.auctionAmount;
        if (bidAmt) {
          setBidAmount(String(bidAmt));
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

  const qcGroupMembers = quickConduct
    ? (quickConduct.group.members || []).map(memberId => memberByGroupMemberId(memberId)).filter(Boolean)
    : [];

  const handleQuickConduct = async () => {
    if (!qcWinnerId) { toast.add("Please select the winning member", "error"); return; }
    if (!qcDate) { toast.add("Please select auction date", "error"); return; }
    if (!qcBidAmount || isNaN(qcBidAmount) || Number(qcBidAmount) <= 0) { toast.add("Please enter a valid bid amount", "error"); return; }
    const installmentNo = quickConduct.installment || quickConduct.group.currentInstallment || 1;
    const ma = quickConduct.scheme?.monthlyAmounts?.find(m => m.month === installmentNo);
    const baseAmt = ma?.auctionAmount || quickConduct.scheme?.auctionAmount || quickConduct.scheme?.amount || 0;
    try {
      await createData('/auctions', {
        id: "A" + Date.now().toString().slice(-6),
        groupId: quickConduct.group.id,
        schemeId: quickConduct.scheme?.id || '',
        date: qcDate,
        installment: installmentNo,
        baseAmount: baseAmt,
        bidAmount: Number(qcBidAmount),
        winnerId: qcWinnerId,
        status: "Completed"
      });
      toast.add("Auction completed successfully!");
      setQuickConduct(null);
      setQcDate("");
      setQcBidAmount("");
      setQcWinnerId("");
      setRefresh(r => r + 1);
    } catch (error) {
      toast.add("Error completing auction: " + error.message, "error");
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="Auction Management"
        subtitle={isUser ? "Your group's auction history" : "Manage and conduct chit auctions"} />

      {!isUser && (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ minWidth: 220 }}>
            <Input label="Select Scheme" value={selectedSchemeId} onChange={v => { setSelectedSchemeId(v); setSelectedGroupId(""); }}
              options={schemes.filter(s => s.status === 'Active').map(s => ({ value: s.id, label: s.name }))} />
          </div>
          <div style={{ minWidth: 260, flex: 1 }}>
            <Input label="Select Group" value={selectedGroupId} onChange={setSelectedGroupId} disabled={!selectedSchemeId}
              options={groups.filter(g => g.status === 'Active' && g.schemeId === selectedSchemeId).map(g => ({ value: g.id, label: g.name + ' — ' + (g.schemeName || schemeById(g.schemeId)?.name || '') + ' (' + (g.members?.length || 0) + ' members)' }))} />
          </div>
          {selectedScheme && (
            <div style={{ padding: "10px 0", fontSize: 13, color: "var(--text-muted)" }}>
              Duration: <strong style={{ color: "var(--text-primary)" }}>{selectedScheme.duration} months</strong>
              <span style={{ margin: "0 12px" }}>·</span>
              Members: <strong style={{ color: "var(--text-primary)" }}>{selectedGroup?.members?.length || 0}</strong>
            </div>
          )}
        </div>
      )}

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

      {quickConduct && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", maxWidth: 560, width: "90%", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", background: "#1e293b", color: "#fff" }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>Conduct Auction</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{quickConduct.group.name} — Installment #{quickConduct.installment || quickConduct.group.currentInstallment || 1}</div>
            </div>

            <div style={{ padding: "0 24px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", padding: "16px 0", borderBottom: "1px solid var(--border-color)", marginBottom: 16 }}>
                <div><span style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Scheme</span><div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{quickConduct.scheme?.name}</div></div>
                <div><span style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Installment</span><div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>#{quickConduct.installment || quickConduct.group.currentInstallment || 1}</div></div>
                <div><span style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Group Members</span><div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{qcGroupMembers.length}</div></div>
                <div><span style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Auction Amount</span><div style={{ fontSize: 13, fontWeight: 700, color: "#d97706" }}>{fmt(Number(qcBidAmount) || 0)}</div></div>
              </div>

              {quickConduct.scheme?.monthlyAmounts?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>All Months — Auction Amounts</div>
                  <div style={{ maxHeight: 110, overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: 8, background: "var(--bg-card-alt)" }}>
                    {quickConduct.scheme.monthlyAmounts.map((m, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 12px", borderBottom: i < quickConduct.scheme.monthlyAmounts.length - 1 ? "1px solid var(--border-color)" : "none", background: m.month === (quickConduct.installment || quickConduct.group.currentInstallment || 1) ? "rgba(37,99,235,0.08)" : "transparent" }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Month {m.month}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: m.month === (quickConduct.installment || quickConduct.group.currentInstallment || 1) ? "#2563eb" : "var(--text-primary)" }}>{fmt(m.auctionAmount || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Auction Date *</div>
                <input type="date" value={qcDate} onChange={e => setQcDate(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 13, boxSizing: "border-box" }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Winning Bid Amount (₹) *</div>
                <input type="number" value={qcBidAmount} onChange={e => setQcBidAmount(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 13, boxSizing: "border-box" }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Select Winning Member *</div>
                <div style={{ maxHeight: 160, overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: 8, background: "var(--bg-card-alt)" }}>
                  {qcGroupMembers.map((m, i) => (
                    <div key={m.id} onClick={() => setQcWinnerId(m.userId)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", cursor: "pointer",
                        background: qcWinnerId === m.userId ? "rgba(37,99,235,0.1)" : "transparent",
                        borderBottom: i < qcGroupMembers.length - 1 ? "1px solid var(--border-color)" : "none",
                        borderLeft: qcWinnerId === m.userId ? "3px solid #2563eb" : "3px solid transparent" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: qcWinnerId === m.userId ? "#2563eb" : "var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", color: qcWinnerId === m.userId ? "#fff" : "var(--text-muted)", fontSize: 11, fontWeight: 700 }}>{m.name?.[0] || "?"}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>ID: {m.userId}</div>
                      </div>
                      {qcWinnerId === m.userId && <div style={{ color: "#2563eb", fontSize: 11, fontWeight: 600 }}>Selected</div>}
                    </div>
                  ))}
                  {qcGroupMembers.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No members found in this group.</div>}
                </div>
              </div>
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-color)", display: "flex", gap: 10, justifyContent: "flex-end", background: "var(--bg-card-alt)" }}>
              <Btn label="Cancel" onClick={() => { setQuickConduct(null); setQcDate(""); setQcBidAmount(""); setQcWinnerId(""); }} />
              <Btn label="Complete Auction" onClick={handleQuickConduct} primary />
            </div>
          </div>
        </div>
      )}

      {!selectedGroupId && !isUser ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <HiPlay size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
          <div style={{ fontSize: 15, marginBottom: 4 }}>Select a group above to view auction details</div>
          <div style={{ fontSize: 13 }}>Choose a group to see all monthly installments and conduct auctions.</div>
        </div>
      ) : (
      <Table cols={["Conduct ID", "Group", "Date", "Installment", "Auction Amount", "Winning Bid", "Winner", "Status", ...(isUser ? [] : ["Actions"])]}
        rows={(() => {
          const rows = [];
          const targetGroups = isUser
            ? groups.filter(g => g.status === 'Active' && g.schemeId && userGroupIds.includes(g.id))
            : groups.filter(g => g.id === selectedGroupId && g.status === 'Active' && g.schemeId);

          targetGroups.forEach(g => {
            const s = schemeById(g.schemeId);
            if (!s) return;
            const duration = s.duration || s.monthlyAmounts?.length || 0;

            for (let i = 1; i <= duration; i++) {
              const ma = s.monthlyAmounts?.find(m => m.month === i);
              const baseAmt = ma?.auctionAmount ?? 0;
              const existingAuction = visibleAuctions.find(a => a.groupId === g.id && a.installment === i);

              const key = g.id + '-' + i;

              if (existingAuction) {
                const winnerMember = memberByGroupMemberId(existingAuction.winnerId);
                const row = [
                  existingAuction.conductId || "—",
                  g.name,
                  existingAuction.date?.split('T')[0],
                  "#" + existingAuction.installment,
                  fmt(existingAuction.baseAmount),
                  fmt(existingAuction.winningBid || 0),
                  existingAuction.winnerId ? `${winnerMember?.name || ""} (${existingAuction.winnerId})` : "—",
                  <Badge key={existingAuction.id} text={existingAuction.status} color={existingAuction.status === "Completed" ? "green" : existingAuction.status === "Scheduled" ? "blue" : "yellow"} />,
                ];
                if (!isUser) row.push(
                  <div key={existingAuction.id} style={{ display: "flex", gap: 6 }}>
                    {existingAuction.status === "Scheduled" && isSuperAdmin && <IconBtn icon={<HiPlay size={14} />} onClick={() => handleConductAuction(existingAuction)} color="#d97706" title="Conduct" />}
                    <IconBtn icon={<HiReceiptRefund size={14} />} onClick={() => handleGenerateReceipt(existingAuction)} color="#7c3aed" title="Receipt" />
                    {isSuperAdmin && <IconBtn icon={<HiPencil size={14} />} onClick={() => handleEdit(existingAuction)} color="#2563eb" title="Edit" />}
                    {isSuperAdmin && <IconBtn icon={<HiTrash size={14} />} onClick={() => handleDelete(existingAuction.id)} color="#dc2626" title="Delete" />}
                  </div>
                );
                rows.push(row);
              } else {
                if (isUser) return;
                if (!g.members?.length) return;
                rows.push([
                  <span key={key + 'cid'} style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>,
                  g.name,
                  <span key={key + 'date'} style={{ color: "var(--text-muted)", fontSize: 12 }}>Not scheduled</span>,
                  "#" + i,
                  fmt(baseAmt), "—", "—",
                  <Badge key={key + 'st'} text="Ready" color={baseAmt > 0 ? "green" : "orange"} />,
                  <div key={key + 'act'} style={{ display: "flex", gap: 6 }}>
                    {isSuperAdmin && <IconBtn icon={<HiPlay size={14} />} onClick={() => {
                      setQuickConduct({ group: g, scheme: s, installment: i });
                      setQcDate(new Date().toISOString().split('T')[0]);
                      setQcBidAmount(String(baseAmt));
                      setQcWinnerId("");
                    }} color="#d97706" title="Conduct" />}
                  </div>
                ]);
              }
            }
          });

          return rows;
        })()} />
      )}
    </div>
  );
}
