import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { useState, useEffect } from "react";

export default function ServiceTypeDialog({ open, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    creditPoints: 0,
    isActive: true,
    category: "routine_maintenance", // Default category
    estimatedTime: 0,
    basePrice: 0,
    requiredSkillLevel: 1,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        creditPoints: initialData.creditPoints || 0,
        isActive: initialData.isActive ?? true,
        category: initialData.category || "routine_maintenance",
        estimatedTime: initialData.estimatedTime || 0,
        basePrice: initialData.basePrice || 0,
        requiredSkillLevel: initialData.requiredSkillLevel || 1,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        creditPoints: 0,
        isActive: true,
        category: "routine_maintenance",
        estimatedTime: 0,
        basePrice: 0,
        requiredSkillLevel: 1,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed z-50 border bg-black border-gray-500 rounded-xl p-6 shadow-lg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
          <Dialog.Title className="text-lg font-semibold mb-4">
            {initialData ? "Edit Service Type" : "Add Service Type"}
          </Dialog.Title>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Service Type Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Credit Points</label>
              <Input
                name="creditPoints"
                type="number"
                value={formData.creditPoints}
                onChange={handleChange}
                placeholder="Enter credit points"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="isActive"
                value={formData.isActive}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="routine_maintenance">Routine Maintenance</option>
                <option value="repair">Repair</option>
                <option value="inspection">Inspection</option>
                <option value="body_work">Body Work</option>
                <option value="washing">Washing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Estimated Time (Hours)</label>
              <Input
                name="estimatedTime"
                type="number"
                value={formData.estimatedTime}
                onChange={handleChange}
                placeholder="Enter estimated time"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Base Price</label>
              <Input
                name="basePrice"
                type="number"
                value={formData.basePrice}
                onChange={handleChange}
                placeholder="Enter base price"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Required Skill Level (1-5)</label>
              <Input
                name="requiredSkillLevel"
                type="number"
                value={formData.requiredSkillLevel}
                onChange={handleChange}
                placeholder="Enter required skill level"
                min="1"
                max="5"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {initialData ? "Update" : "Add"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
