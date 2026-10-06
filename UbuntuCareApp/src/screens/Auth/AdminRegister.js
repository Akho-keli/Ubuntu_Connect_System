import React, { useState } from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, StyleSheet } from "react-native";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { registerAdmin } from "../../services/authService";
import { friendlyFirebaseError, isValidEmail, isValidPhone, isStrongPassword } from "../../utils/validators";

// Simple gate so random people can't self-register as admins.
// In production, replace with an invite-link / super-admin approval flow.
const ADMIN_INVITE_CODE = "UBUNTU-ADMIN-2026";

const colors = { bg: "#0B1120", card: "#FFFFFF", accent: "#60A5FA", text: "#0F172A", subtext: "#64748B", primary: "#2563EB", danger: "#DC2626" };

export default function AdminRegister({ navigation }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", department: "", inviteCode: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [regError, setRegError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => { setForm((p) => ({ ...p, [key]: val })); setErrors((p) => ({ ...p, [key]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required.";
    if (!form.lastName.trim()) e.lastName = "Required.";
    if (!isValidEmail(form.email)) e.email = "Enter a valid email.";
    if (!isValidPhone(form.phone)) e.phone = "Enter a valid phone number.";
    if (!form.department.trim()) e.department = "Required.";
    if (form.inviteCode !== ADMIN_INVITE_CODE) e.inviteCode = "Invalid invite code.";
    if (!isStrongPassword(form.password)) e.password = "At least 6 characters.";
    if (form.confirmPassword !== form.password) e.confirmPassword = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    setRegError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await registerAdmin({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        department: form.department.trim(),
        password: form.password,
      });
      navigation.reset({ index: 0, routes: [{ name: "AdminDashboard" }] });
    } catch (err) {
      setRegError(friendlyFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => navigation.navigate("AdminLogin")} style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.accent, fontWeight: "800" }}>← Back to Admin Login</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Create Admin Account</Text>

        <View style={styles.card}>
          <View style={{ flexDirection: "row" }}>
            <Input label="First Name" value={form.firstName} onChangeText={set("firstName")} error={errors.firstName} style={{ flex: 1, marginRight: 8 }} />
            <Input label="Last Name" value={form.lastName} onChangeText={set("lastName")} error={errors.lastName} style={{ flex: 1 }} />
          </View>
          <Input label="Admin Email" value={form.email} onChangeText={set("email")} error={errors.email} autoCapitalize="none" keyboardType="email-address" />
          <Input label="Phone" value={form.phone} onChangeText={set("phone")} error={errors.phone} keyboardType="phone-pad" />
          <Input label="Department" placeholder="e.g. Operations, Finance" value={form.department} onChangeText={set("department")} error={errors.department} />
          <Input label="Admin Invite Code" placeholder="Provided by super admin" value={form.inviteCode} onChangeText={set("inviteCode")} error={errors.inviteCode} autoCapitalize="characters" />
          <Input label="Password" value={form.password} onChangeText={set("password")} error={errors.password} secureTextEntry />
          <Input label="Confirm Password" value={form.confirmPassword} onChangeText={set("confirmPassword")} error={errors.confirmPassword} secureTextEntry />

          {regError ? <View style={styles.errorBox}><Text style={styles.errorText}>{regError}</Text></View> : null}

          <Button title="Create Admin Account" onPress={handleRegister} loading={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, flexGrow: 1 },
  pageTitle: { color: "#fff", fontSize: 22, fontWeight: "900", marginBottom: 16, textAlign: "center" },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 22 },
  errorBox: { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", borderRadius: 10, padding: 10, marginBottom: 14 },
  errorText: { color: colors.danger, fontSize: 11, textAlign: "center", fontWeight: "700" },
});
