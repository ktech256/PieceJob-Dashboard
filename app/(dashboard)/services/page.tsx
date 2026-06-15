"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  ClipboardList,
  Users,
  ShieldCheck,
  ArrowRight,
  MoreVertical,
  Plus,
  RefreshCcw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Wrench,
  Settings,
  X
} from 'lucide-react';

const GENDER_RULES = ['MEN_ONLY', 'WOMEN_ONLY', 'BOTH'];
const VERIFICATION_LEVELS = ['STANDARD', 'PROFESSIONAL', 'TRADE', 'HIGH_VETTING'];

export default function ServiceCatalog() {
  const { countryCode } = useCountryStore();
  const [activeTab, setActiveTab] = useState('services'); // 'services' or 'categories'
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [currentService, setCurrentService] = useState<any>(null);
  const [currentCategory, setCurrentCategory] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
        const [servRes, catRes] = await Promise.all([
            api.get(`/api/admin/services?countryCode=${countryCode}`),
            api.get('/api/admin/categories')
        ]);
        setServices(servRes.data.services || []);
        setCategories(catRes.data.data || []);
    } catch (e) {
        console.error('Failed to load data');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) loadData();
  }, [countryCode]);

  const filteredServices = services.filter(s => {
      const matchesCategory = activeCategory ? s.category === activeCategory : true;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());

      // Handle array for equipment
      const payload = {
          ...data,
          equipmentRequired: (data.equipmentRequired as string).split(',').map(i => i.trim()).filter(i => i),
          isActive: data.isActive === 'on',
          countryCode: data.countryCode || 'GLOBAL'
      };

      try {
          if (currentService?._id) {
              await api.patch(`/api/admin/services/${currentService._id}`, payload);
          } else {
              await api.post('/api/admin/services', payload);
          }
          setShowModal(false);
          loadData();
      } catch (e) {
          alert('Failed to save service');
      }
  };

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());

      const payload = {
          ...data,
          isActive: data.isActive === 'on',
          sortOrder: parseInt(data.sortOrder as string) || 0
      };

      try {
          if (currentCategory?._id) {
              await api.patch(`/api/admin/categories/${currentCategory._id}`, payload);
          } else {
              await api.post('/api/admin/categories', payload);
          }
          setShowCategoryModal(false);
          loadData();
      } catch (e) {
          alert('Failed to save category');
      }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
      try {
          await api.patch(`/api/admin/services/${id}/toggle`, { isActive: !currentStatus });
          loadData();
      } catch (e) {
          alert('Failed to toggle status');
      }
  };

  const handleDelete = async (id: string) => {
      if (!confirm('Are you sure you want to delete this service? Historical jobs may be affected in analytics.')) return;
      try {
          await api.delete(`/api/admin/services/${id}`);
          loadData();
      } catch (e) {
          alert('Failed to delete service');
      }
  };

  const handleToggleCategory = async (id: string, currentStatus: boolean) => {
    try {
        await api.patch(`/api/admin/categories/${id}/toggle`, { isActive: !currentStatus });
        loadData();
    } catch (e) {
        alert('Failed to toggle category status');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to soft-delete this category? Existing services will remain intact.')) return;
    try {
        await api.delete(`/api/admin/categories/${id}`);
        loadData();
    } catch (e) {
        alert('Failed to delete category');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Service Infrastructure</h1>
          <p className="text-neutral-500 font-medium text-sm">Manage global catalog, categories, and rule sets for the marketplace.</p>
        </div>
        <div className="flex gap-2">
            <div className="flex bg-neutral-100 p-1 rounded-2xl mr-4">
                <button
                    onClick={() => setActiveTab('services')}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'services' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400'}`}
                >
                    Services
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'categories' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400'}`}
                >
                    Categories
                </button>
            </div>
            <button onClick={loadData} className="p-3 bg-white border rounded-2xl hover:bg-neutral-50 transition-all shadow-sm"><RefreshCcw size={18} /></button>
            {activeTab === 'services' ? (
                <button
                    onClick={() => { setCurrentService(null); setShowModal(true); }}
                    className="bg-neutral-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-black/10"
                >
                    <Plus size={16} />
                    Add Service
                </button>
            ) : (
                <button
                    onClick={() => { setCurrentCategory(null); setShowCategoryModal(true); }}
                    className="bg-brand-customer-red text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-brand-customer-red/10"
                >
                    <Plus size={16} />
                    Add Category
                </button>
            )}
        </div>
      </div>

      {activeTab === 'services' ? (
        <>
            {/* FILTER BAR */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[24px] border border-neutral-100 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${!activeCategory ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100'}`}
                    >
                        All
                    </button>
                    {categories.filter(c => c.isActive).map(cat => (
                        <button
                            key={cat.code}
                            onClick={() => setActiveCategory(cat.code)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeCategory === cat.code ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                    <input
                        type="text"
                        placeholder="Search services or codes..."
                        className="w-full bg-neutral-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm font-bold outline-none ring-1 ring-neutral-100 focus:ring-neutral-900 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* SERVICE LIST GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-xs font-bold text-neutral-300 uppercase tracking-[0.2em] animate-pulse">Synchronizing catalog...</div>
                ) : filteredServices.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-neutral-400 flex flex-col items-center gap-4">
                        <ClipboardList size={48} className="opacity-20" />
                        <p className="font-black uppercase text-xs tracking-widest">No services matching filters.</p>
                    </div>
                ) : (
                    filteredServices.map((service) => (
                        <ServiceCard
                            key={service._id}
                            service={service}
                            categoryName={categories.find(c => c.code === service.category)?.name || service.category}
                            onToggle={() => handleToggle(service._id, service.isActive)}
                            onEdit={() => { setCurrentService(service); setShowModal(true); }}
                            onDelete={() => handleDelete(service._id)}
                        />
                    ))
                )}
            </div>
        </>
      ) : (
          <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                          <tr>
                              <th className="px-8 py-5">Code</th>
                              <th className="px-8 py-5">Display Name</th>
                              <th className="px-8 py-5">Sort</th>
                              <th className="px-8 py-5">Status</th>
                              <th className="px-8 py-5 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50 text-sm font-bold">
                          {categories.map(cat => (
                              <tr key={cat._id} className="hover:bg-neutral-50/50 transition-all">
                                  <td className="px-8 py-5 font-mono text-xs text-neutral-400">{cat.code}</td>
                                  <td className="px-8 py-5 text-neutral-900">{cat.name}</td>
                                  <td className="px-8 py-5 text-[10px]">{cat.sortOrder}</td>
                                  <td className="px-8 py-5">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${cat.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                          {cat.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                      <div className="flex justify-end gap-2">
                                          <button onClick={() => { setCurrentCategory(cat); setShowCategoryModal(true); }} className="p-2 text-neutral-400 hover:text-neutral-900 transition-all"><Edit size={16} /></button>
                                          <button onClick={() => handleToggleCategory(cat._id, cat.isActive)} className="p-2 text-neutral-400 hover:text-neutral-900 transition-all">
                                              {cat.isActive ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                                          </button>
                                          <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 text-neutral-400 hover:text-brand-customer-red transition-all"><Trash2 size={16} /></button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* SERVICE MODAL */}
      {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-10 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">{currentService ? 'Modify Service Rules' : 'Create Global Service'}</h3>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Rule Impact: Android Customer & Provider Apps</p>
                      </div>
                      <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm"><XCircle size={24} className="text-neutral-300" /></button>
                  </div>
                  <form onSubmit={handleSave} className="p-10 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                          <FormGroup label="Service Code (e.g. HDS-01)" name="code" defaultValue={currentService?.code} required />
                          <FormGroup label="Service Name" name="name" defaultValue={currentService?.name} required />
                          <SelectGroup label="Category" name="category" options={categories.map(c => ({ value: c.code, label: c.name }))} defaultValue={currentService?.category} />
                          <SelectGroup label="Gender Rule" name="genderRule" options={GENDER_RULES.map(r => ({ value: r, label: r.replace('_', ' ') }))} defaultValue={currentService?.genderRule} />
                          <SelectGroup label="Verification Requirement" name="verificationLevel" options={VERIFICATION_LEVELS.map(l => ({ value: l, label: l.replace('_', ' ') }))} defaultValue={currentService?.verificationLevel} />
                          <FormGroup label="Equipment (Comma separated)" name="equipmentRequired" defaultValue={currentService?.equipmentRequired?.join(', ')} />
                          <FormGroup label="Target Country (Default: GLOBAL)" name="countryCode" defaultValue={currentService?.countryCode || 'GLOBAL'} />
                          <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                <input type="checkbox" name="isActive" defaultChecked={currentService ? currentService.isActive : true} className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" />
                                <label className="text-xs font-black text-neutral-800 uppercase">Service Active</label>
                          </div>
                      </div>
                      <div className="pt-4">
                          <button type="submit" className="w-full bg-neutral-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                            Commit Service to Catalog
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-10 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">{currentCategory ? 'Modify Category' : 'Provision New Category'}</h3>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Impact: Service Grouping & Listing</p>
                    </div>
                    <button onClick={() => setShowCategoryModal(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm"><X size={24} className="text-neutral-300" /></button>
                </div>
                <form onSubmit={handleSaveCategory} className="p-10 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <FormGroup label="Category Code (Immutable if edit)" name="code" defaultValue={currentCategory?.code} required readOnly={!!currentCategory} />
                        <FormGroup label="Display Name" name="name" defaultValue={currentCategory?.name} required />
                        <div className="col-span-2">
                             <FormGroup label="Description" name="description" defaultValue={currentCategory?.description} />
                        </div>
                        <FormGroup label="Sort Order" name="sortOrder" type="number" defaultValue={currentCategory?.sortOrder || 0} />
                        <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                            <input type="checkbox" name="isActive" defaultChecked={currentCategory ? currentCategory.isActive : true} className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" />
                            <label className="text-xs font-black text-neutral-800 uppercase">Category Active</label>
                        </div>
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="w-full bg-brand-customer-red text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                        Commit Category Registry
                        </button>
                    </div>
                </form>
            </div>
          </div>
      )}
    </div>
  );
}

function ServiceCard({ service, categoryName, onToggle, onEdit, onDelete }: any) {
    return (
        <div className={`bg-white border rounded-[40px] p-8 shadow-sm group transition-all flex flex-col justify-between h-[380px] ${service.isActive ? 'border-neutral-200 hover:border-brand-customer-red/30' : 'border-neutral-100 opacity-60'}`}>
            <div>
                <div className="flex justify-between items-start mb-6">
                    <span className="bg-neutral-50 px-4 py-2 rounded-2xl font-mono text-[10px] font-black text-neutral-400 group-hover:text-brand-customer-red transition-all uppercase tracking-tighter border border-neutral-100">{service.code}</span>
                    <div className="flex gap-1">
                        <button onClick={onEdit} className="p-2 text-neutral-300 hover:text-neutral-900 transition-all"><Edit size={16} /></button>
                        <button onClick={onToggle} className={`p-2 transition-all ${service.isActive ? 'text-brand-provider-green' : 'text-neutral-300'}`}>
                            {service.isActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        </button>
                        <button onClick={onDelete} className="p-2 text-neutral-300 hover:text-brand-customer-red transition-all"><Trash2 size={16} /></button>
                    </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-2 h-2 rounded-full ${service.isActive ? 'bg-brand-provider-green animate-pulse' : 'bg-neutral-300'}`}></div>
                    <h3 className="text-2xl font-black text-neutral-900 leading-tight">{service.name}</h3>
                </div>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{categoryName}</p>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-neutral-50 rounded-3xl border border-neutral-100">
                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Users size={10} /> Gender Rule
                        </p>
                        <span className={`text-[10px] font-black uppercase ${
                            service.genderRule.includes('WOMEN') ? 'text-pink-600' :
                            service.genderRule.includes('MEN') ? 'text-blue-600' : 'text-neutral-600'
                        }`}>
                            {service.genderRule.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-3xl border border-neutral-100">
                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <ShieldCheck size={10} /> Verification
                        </p>
                        <span className={`text-[10px] font-black uppercase ${
                            service.verificationLevel.includes('HIGH') ? 'text-brand-customer-red' :
                            service.verificationLevel === 'TRADE' ? 'text-purple-600' : 'text-brand-provider-green'
                        }`}>
                            {service.verificationLevel.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-neutral-50/50 rounded-2xl overflow-hidden">
                    <Wrench size={12} className="text-neutral-300 shrink-0" />
                    <div className="flex gap-1 overflow-x-auto no-scrollbar">
                        {service.equipmentRequired.length > 0 ? (
                            service.equipmentRequired.map((eq: string, i: number) => (
                                <span key={i} className="whitespace-nowrap bg-white px-2 py-0.5 rounded text-[8px] font-bold text-neutral-500 border border-neutral-100 uppercase">{eq}</span>
                            ))
                        ) : (
                            <span className="text-[8px] font-bold text-neutral-300 uppercase">No equipment specified</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function FormGroup({ label, name, defaultValue, required, placeholder, type = "text", readOnly = false }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">{label}</label>
            <input
                name={name}
                type={type}
                defaultValue={defaultValue}
                required={required}
                placeholder={placeholder}
                readOnly={readOnly}
                className={`w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none ring-1 ring-transparent focus:ring-neutral-900 focus:bg-white transition-all ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
        </div>
    );
}

function SelectGroup({ label, name, options, defaultValue }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">{label}</label>
            <div className="relative">
                <select
                    name={name}
                    defaultValue={defaultValue}
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3.5 text-sm font-black outline-none ring-1 ring-transparent focus:ring-neutral-900 focus:bg-white transition-all appearance-none"
                >
                    {options.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                    <Filter size={12} />
                </div>
            </div>
        </div>
    );
}
