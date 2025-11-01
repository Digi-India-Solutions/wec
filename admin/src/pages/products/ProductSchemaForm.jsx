
// import { ReactNode, useState } from 'react';
// import Button from '../../components/base/Button';
// import Input from '../../components/base/Input';
// import { clsx } from 'clsx';
// import { postData } from '../../services/FetchNodeServices';
// import { t } from 'i18next';
// import { useToast } from '../../components/base/Toast';

// export default function SchemaForm({
//   fields,
//   activeTab,
//   initialData = {},
//   editingItem,
//   fetchCategoryData,
//   fetchBrandData,
//   fetchTypeData,
//   onCancel,
//   allCategories,
//   allBrands,
//   // setIsModalOpen,
//   submitText = 'Save',
//   cancelText = 'Cancel'
// }) {
//   const { showToast, ToastContainer } = useToast();
//   const [formData, setFormData] = useState(initialData);
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const user = JSON.parse(sessionStorage.getItem('user') || '{}');

//   const handleChange = (name, value) => {
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const handleFileChange = (name, file) => {
//     if (file) {
//       setFormData(prev => ({ ...prev, [name]: file }));
//     } else {
//       setFormData(prev => ({ ...prev, [name]: '' }));
//     }
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };
//   console.log("SSSSSSSS:==>", formData, activeTab)

//   // console.log("SSSSSSSS:==>", { createdByEmail: { name: user?.name, email: user?.email } ,user })

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     let data = {};
//     let q = '';



//     if (activeTab === 'categories') {
//       data = { ...formData, createdByEmail: { name: user?.name, email: user?.email } }
//       q = editingItem ? `api/category/update-category-by-admin/${editingItem?._id}` : `api/category/create-category-by-admin`
//     } else if (activeTab === 'brands') {
//       const category = allCategories.filter((c) => c.name === formData?.categoryId)
//       data = { ...formData, categoryIds: category[0]?._id, createdByEmail: { name: user?.name, email: user?.email } }
//       q = editingItem ? `api/brand/update-brand-by-admin/${editingItem?._id}` : `api/brand/create-brand-by-admin`
//     } else if (activeTab === 'types') {
//       const category = allCategories.filter((c) => c.name === formData?.categoryId)
//       const brand = allBrands.filter((c) => c.name === formData?.brandId)
//       data = { ...formData, categoryIds: category[0]?._id, brandIds: brand[0]?._id, createdByEmail: { name: user?.name, email: user?.email } }
//       q = editingItem?`api/type/update-type-by-admin/${editingItem?._id}`:`api/type/create-type-by-admin`
//     }
//     console.log("FFFFF:==>", data)

//     const respons = await postData(q, data);
//     // console.log("SSSSSSSS:==>", respons)

//     if (respons?.status === true) {
//       setLoading(false);
//       showToast(respons?.message, 'success');
//       fetchCategoryData()
//       fetchBrandData()
//       fetchTypeData()
//       onCancel()
//     } else {
//       showToast(respons?.message, 'error');
//       setLoading(false);
//     }
//   };

//   const renderField = (field) => {
//     const value = formData[field.name] || '';
//     const error = errors[field.name];

//     switch (field.type) {
//       case 'textarea':
//         return (
//           <div key={field.name} className="space-y-1">
//             <label className="block text-sm font-medium text-gray-700">
//               {field.label} {field.required && <span className="text-red-500">*</span>}
//             </label>
//             <textarea
//               value={value}
//               onChange={(e) => handleChange(field.name, e.target.value)}
//               className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${error
//                 ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
//                 : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
//                 }`}
//               rows={3}
//               placeholder={`Enter ${field.label.toLowerCase()}`}
//             />
//             {error && <p className="text-sm text-red-600">{error}</p>}
//           </div>
//         );

//       case 'select':
//         return (
//           <div key={field.name} className="space-y-1">
//             <label className="block text-sm font-medium text-gray-700">
//               {field.label} {field.required && <span className="text-red-500">*</span>}
//             </label>
//             <div className="relative">
//               <select
//                 value={value}
//                 onChange={(e) => handleChange(field.name, e.target.value)}
//                 className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 pr-8 ${error
//                   ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
//                   : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
//                   }`}
//               >
//                 <option value="">Select {field.label}</option>
//                 {field.options?.map(option => (
//                   <option key={option.name || option.value} value={option.name || option.value}>
//                     {option.name || option.label}
//                   </option>
//                 ))}
//               </select>
//               <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
//                 <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
//               </div>
//             </div>
//             {error && <p className="text-sm text-red-600">{error}</p>}
//           </div>
//         );

//       case 'date':
//         return (
//           <div key={field.name} className="space-y-1">
//             <label className="block text-sm font-medium text-gray-700">
//               {field.label} {field.required && <span className="text-red-500">*</span>}
//             </label>
//             <input
//               type="date"
//               value={value}
//               onChange={(e) => handleChange(field.name, e.target.value)}
//               className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${error
//                 ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
//                 : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
//                 }`}
//             />
//             {error && <p className="text-sm text-red-600">{error}</p>}
//           </div>
//         );

//       case 'file':
//         return (
//           <div key={field.name} className="space-y-1">
//             <label className="block text-sm font-medium text-gray-700">
//               {field.label} {field.required && <span className="text-red-500">*</span>}
//             </label>
//             <div className="flex items-center space-x-3">
//               <input
//                 type="file"
//                 accept={field.accept}
//                 onChange={(e) => handleFileChange(field.name, e.target.files?.[0] || null)}
//                 className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${error ? 'border-red-300' : 'border-gray-300'
//                   }`}
//               />
//               {value && (
//                 <div className="flex items-center space-x-2 text-sm text-green-600">
//                   <i className="ri-check-line w-4 h-4 flex items-center justify-center"></i>
//                   <span>Uploaded</span>
//                 </div>
//               )}
//             </div>
//             {field.accept && (
//               <p className="text-xs text-gray-500">
//                 Accepted formats: {field.accept.replace(/\./g, '').toUpperCase()}
//               </p>
//             )}
//             {error && <p className="text-sm text-red-600">{error}</p>}
//           </div>
//         );

//       default:
//         return (
//           <div key={field.name} className="space-y-1">
//             <label className="block text-sm font-medium text-gray-700">
//               {field.label} {field.required && <span className="text-red-500">*</span>}
//             </label>
//             <input
//               type={field.type}
//               value={value}
//               onChange={(e) => handleChange(field.name, e.target.value)}
//               className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${error
//                 ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
//                 : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
//                 }`}
//               placeholder={`Enter ${field.label.toLowerCase()}`}
//             />
//             {error && <p className="text-sm text-red-600">{error}</p>}
//           </div>
//         );
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <ToastContainer />
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {fields.map(renderField)}
//       </div>

//       <div className="flex justify-end space-x-3 pt-4">
//         {onCancel && (
//           <Button
//             type="button"
//             variant="secondary"
//             onClick={onCancel}
//             disabled={loading}
//           >
//             {cancelText}
//           </Button>
//         )}
//         <Button
//           type="submit"
//           loading={loading}
//           disabled={loading}
//         >
//           {submitText}
//         </Button>
//       </div>
//     </form>
//   );
// }



import { useState } from 'react';
import Button from '../../components/base/Button';
import { postData } from '../../services/FetchNodeServices';
import { useToast } from '../../components/base/Toast';

export default function SchemaForm({
  fields, activeTab, initialData = {}, editingItem, fetchCategoryData, fetchBrandData, fetchTypeData,
  onCancel, allCategories, allBrands, submitText = 'Save', cancelText = 'Cancel'
}) {
  const { showToast, ToastContainer } = useToast();
  const [formData, setFormData] = useState(initialData);
  const [typeNames, setTypeNames] = useState(initialData?.typeNames || ['']); // Multiple Type Names
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  // 🔹 Handle changes
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (name, file) => {
    setFormData(prev => ({ ...prev, [name]: file || '' }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // 🔹 Add or remove type name fields dynamically
  const handleTypeNameChange = (index, value) => {
    const updated = [...typeNames];
    updated[index] = value;
    setTypeNames(updated);
  };

  const addTypeNameField = () => setTypeNames([...typeNames, '']);
  const removeTypeNameField = (index) => {
    const updated = typeNames.filter((_, i) => i !== index);
    setTypeNames(updated);
  };

  // 🔹 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let data = {};
    let endpoint = '';

    if (activeTab === 'categories') {
      data = { ...formData, typeNames, createdByEmail: { name: user?.name, email: user?.email } };
      endpoint = editingItem ? `api/category/update-category-by-admin/${editingItem?._id}` : `api/category/create-category-by-admin`;
    } else if (activeTab === 'brands') {
      const category = allCategories.find(c => c.name === formData?.categoryId);
      data = {
        ...formData,
        categoryIds: category?._id,
        createdByEmail: { name: user?.name, email: user?.email }
      };
      endpoint = editingItem
        ? `api/brand/update-brand-by-admin/${editingItem?._id}`
        : `api/brand/create-brand-by-admin`;
    } else if (activeTab === 'types') {
      const category = allCategories.find(c => c.name === formData?.categoryId);
      const brand = allBrands.find(b => b.name === formData?.brandId);
      data = {
        ...formData,
        typeNames: typeNames.filter(n => n.trim() !== ''),
        categoryIds: category?._id,
        brandIds: brand?._id,
        createdByEmail: { name: user?.name, email: user?.email }
      };
      endpoint = editingItem
        ? `api/type/update-type-by-admin/${editingItem?._id}`
        : `api/type/create-type-by-admin`;
    }

    const response = await postData(endpoint, data);
    setLoading(false);

    if (response?.status) {
      showToast(response?.message, 'success');
      fetchCategoryData?.();
      fetchBrandData?.();
      fetchTypeData?.();
      onCancel?.();
    } else {
      showToast(response?.message || 'Something went wrong', 'error');
    }
  };

  // 🔹 Render input fields
  const renderField = (field) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    // Skip name field for "types" since we handle multiple names below
    if (activeTab === 'types' && field.name === 'name') return null;

    switch (field.type) {
      case 'select':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${error
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'}`}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      default:
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={`Enter ${field.label}`}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${error
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'}`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ToastContainer />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(renderField)}
      </div>

      {/* ✅ Multiple Type Names for 'types' */}
      {activeTab === 'categories' && (
        <div className="col-span-2 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Type Names <span className="text-red-500">*</span>
          </label>

          {typeNames.map((name, idx) => (
            <div key={idx} className="flex space-x-2">
              <input
                type="text"
                value={name}
                onChange={(e) => handleTypeNameChange(idx, e.target.value)}
                placeholder={`Enter Type Name ${idx + 1}`}
                className="flex-1 rounded-lg border px-3 py-2 text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
              {idx > 0 && (
                <Button type="button" variant="danger" onClick={() => removeTypeNameField(idx)}>
                  <i className="ri-delete-bin-line"></i>
                </Button>
              )}
            </div>
          ))}

          <Button type="button" variant="secondary" onClick={addTypeNameField} className="mt-2">
            <i className="ri-add-line mr-1"></i> Add More
          </Button>
        </div>
      )}

      {/* ✅ Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
        )}
        <Button type="submit" loading={loading} disabled={loading}>
          {submitText}
        </Button>
      </div>
    </form>
  );
}
