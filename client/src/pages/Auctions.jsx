// Auctions page component
import { useState } from "react";
import { useData } from "../hooks/useData";
import { createData, updateData, deleteData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { fmt, genId } from "../utils/helpers";

export function Auctions({ dark, toast, setPreview }) {
  const { data: auctions, loading } = useData('/auctions');
  const [refresh, setRefresh] = useState(0);
  const { data: groups } = useData('/groups');
  const { data: schemes } = useData('/schemes');
  const [showForm, setShowForm] = useState(false);
  const [editingAuction, setEditingAuction] = useState(null);
  const [form, setForm] = useState({ groupId: "", date: "", installment: "", baseAmount: "" });
  const [errors, setErrors] = useState({});
  const [conductingAuction, setConductingAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [winner, setWinner] = useState(null);
  
  const groupById = (id) => groups.find((g) => g.id === id);
  const schemeById = (id) => schemes.find((s) => s.id === id);

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
  };

  const handlePlaceBid = () => {
    if (!bidAmount || isNaN(bidAmount) || Number(bidAmount) <= 0) {
      toast.add("Please enter a valid bid amount", "error");
      return;
    }
    setWinner({ id: "W" + Date.now().toString().slice(-6), name: "Bidder " + Math.floor(Math.random() * 100), bidAmount: Number(bidAmount) });
    toast.add("Bid placed successfully!");
  };

  const handleCompleteAuction = async () => {
    if (!winner) {
      toast.add("Please place a winning bid first", "error");
      return;
    }
    
    try {
      await updateData('/auctions', conductingAuction.id, {
        ...conductingAuction,
        status: "Completed",
        winningBid: winner.bidAmount,
        winnerId: winner.id
      });
      toast.add("Auction completed successfully!");
      setConductingAuction(null);
      setWinner(null);
      setBidAmount("");
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error completing auction: " + error.message, "error");
    }
  };

  const handleGenerateReceipt = (auction) => {
    const g = groupById(auction.groupId);
    const s = g ? schemeById(g.schemeId) : null;
    setPreview({
      title: "Auction Receipt",
      docNo: "AUC" + auction.id,
      chit: { "Group": g?.name, "Scheme": s?.name, "Installment": "#" + auction.installment, "Base Amount": fmt(auction.baseAmount), "Winning Bid": fmt(auction.winningBid || 0) },
      payments: {
        headers: ["Description", "Amount"],
        rows: [["Base Amount", fmt(auction.baseAmount)], ["Winning Bid", fmt(auction.winningBid || 0)], ["Discount", fmt(auction.baseAmount - (auction.winningBid || 0))]]
      },
      amount: auction.winningBid || auction.baseAmount,
      notes: auction.status === "Completed" ? "Auction completed successfully." : "Auction receipt."
    });
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="Auction Management" subtitle="Schedule and conduct chit auctions" dark={dark}
        actions={[<Btn key="a" label="+ Schedule Auction" onClick={() => { setEditingAuction(null); setForm({ groupId: "", date: "", installment: "", baseAmount: "" }); setShowForm(true); }} primary />]} />

      {showForm && (
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#f9fafb", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>{editingAuction ? "Edit Auction" : "Schedule Auction"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 20px" }}>
            <div>
              <Input label="Group *" value={form.groupId} onChange={v => setForm({ ...form, groupId: v })} dark={dark} options={groups.map(g => ({ value: g.id, label: g.name }))} />
              {errors.groupId && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.groupId}</div>}
            </div>
            <div>
              <Input label="Auction Date *" value={form.date} onChange={v => setForm({ ...form, date: v })} type="date" dark={dark} />
              {errors.date && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.date}</div>}
            </div>
            <div>
              <Input label="Installment No *" value={form.installment} onChange={v => setForm({ ...form, installment: v })} type="number" dark={dark} />
              {errors.installment && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.installment}</div>}
            </div>
            <div>
              <Input label="Base Amount (₹) *" value={form.baseAmount} onChange={v => setForm({ ...form, baseAmount: v })} type="number" dark={dark} />
              {errors.baseAmount && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.baseAmount}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn label={editingAuction ? "Update Auction" : "Schedule Auction"} onClick={handleSubmit} primary />
            <Btn label="Cancel" onClick={() => { setShowForm(false); setEditingAuction(null); setForm({ groupId: "", date: "", installment: "", baseAmount: "" }); setErrors({}); }} />
          </div>
        </div>
      )}

      {/* Auction Conduction Modal */}
      {conductingAuction && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: dark ? "#1f2937" : "#fff", borderRadius: 12, padding: 24, maxWidth: 500, width: "90%" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Conduct Auction - {groupById(conductingAuction.groupId)?.name}</div>
            <div style={{ marginBottom: 16, fontSize: 13, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>Base Amount: {fmt(conductingAuction.baseAmount)}</div>
            
            {!winner ? (
              <div>
                <Input label="Enter Bid Amount" value={bidAmount} onChange={setBidAmount} type="number" dark={dark} />
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <Btn label="Place Bid" onClick={handlePlaceBid} primary />
                  <Btn label="Cancel" onClick={() => { setConductingAuction(null); setBidAmount(""); }} />
                </div>
              </div>
            ) : (
              <div>
                <div style={{ padding: 16, background: dark ? "rgba(255,255,255,.05)" : "#f9fafb", borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 8 }}>Winning Bid</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#16a34a" }}>{fmt(winner.bidAmount)}</div>
                  <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginTop: 4 }}>Winner: {winner.name}</div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn label="Complete Auction" onClick={handleCompleteAuction} primary />
                  <Btn label="Cancel" onClick={() => { setConductingAuction(null); setWinner(null); setBidAmount(""); }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Table dark={dark} cols={["Group", "Date", "Installment", "Base Amount", "Winning Bid", "Status", "Actions"]}
        rows={auctions.map(a => {
          const g = groupById(a.groupId);
          return [g?.name, a.date?.split('T')[0], "#" + a.installment, fmt(a.baseAmount), fmt(a.winningBid || 0),
            <Badge key={a.id} text={a.status} color={a.status === "Completed" ? "green" : a.status === "Scheduled" ? "blue" : "yellow"} />,
            <div key={a.id} style={{ display: "flex", gap: 6 }}>
              {a.status === "Scheduled" && <button onClick={() => handleConductAuction(a)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #d97706", background: "transparent", color: "#d97706", cursor: "pointer" }}>Conduct</button>}
              <button onClick={() => handleGenerateReceipt(a)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #7c3aed", background: "transparent", color: "#7c3aed", cursor: "pointer" }}>Receipt</button>
              <button onClick={() => handleEdit(a)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #2563eb", background: "transparent", color: "#2563eb", cursor: "pointer" }}>Edit</button>
              <button onClick={() => handleDelete(a.id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #dc2626", background: "transparent", color: "#dc2626", cursor: "pointer" }}>Delete</button>
            </div>
          ];
        })} />
    </div>
  );
}
