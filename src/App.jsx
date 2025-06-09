import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State for filters, sorting, pagination, data, errors, and selected character
  const [filters, setFilters] = useState({ name: '', status: '', species: '', gender: '' });
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [characters, setCharacters] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Fetch data from Rick and Morty API
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      setSelectedCharacter(null);
      try {
        // Build API URL with filters and pagination
        let url = `https://rickandmortyapi.com/api/character/?page=${page}`;
        if (filters.name) url += `&name=${filters.name}`;
        if (filters.status) url += `&status=${filters.status}`;
        if (filters.species) url += `&species=${filters.species}`;
        if (filters.gender) url += `&gender=${filters.gender}`;
        // Fetch data
        const res = await fetch(url);
        if (!res.ok) throw new Error('API isteği başarısız oldu.');
        const data = await res.json();
        setCharacters(data.results || []);
        setTotalCount(data.info?.count || 0);
      } catch (err) {
        setCharacters([]);
        setTotalCount(0);
        setError('Veri alınırken bir hata oluştu veya sonuç bulunamadı.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filters, page, pageSize]);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1); // Reset to first page on filter change
  };

  // Handle sorting (client-side for demo)
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Sort characters client-side
  const sortedCharacters = [...characters].sort((a, b) => {
    if (!sortBy) return 0;
    if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle page size change
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  // Pagination controls
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="app-container">
      <h1>Rick and Morty Karakter Tablosu</h1>
      {/* Filter Controls */}
      <div className="filters">
        <input
          type="text"
          name="name"
          placeholder="İsme göre filtrele"
          value={filters.name}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="species"
          placeholder="Tür (species)"
          value={filters.species}
          onChange={handleFilterChange}
        />
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">Durum (status)</option>
          <option value="alive">Alive</option>
          <option value="dead">Dead</option>
          <option value="unknown">Unknown</option>
        </select>
        <select name="gender" value={filters.gender} onChange={handleFilterChange}>
          <option value="">Cinsiyet (gender)</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="genderless">Genderless</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>
      {/* Page Size Selector */}
      <div className="page-size">
        <label>Sayfa Boyutu: </label>
        <select value={pageSize} onChange={handlePageSizeChange}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
      {/* Error Message */}
      {error && <div className="error">{error}</div>}
      {/* Table */}
      <table className="character-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('id')}>ID</th>
            <th onClick={() => handleSort('name')}>İsim</th>
            <th onClick={() => handleSort('status')}>Durum</th>
            <th onClick={() => handleSort('species')}>Tür</th>
            <th onClick={() => handleSort('gender')}>Cinsiyet</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5}>Yükleniyor...</td></tr>
          ) : sortedCharacters.length === 0 ? (
            <tr><td colSpan={5}>Sonuç bulunamadı.</td></tr>
          ) : (
            sortedCharacters.slice(0, pageSize).map((char) => (
              <tr key={char.id} onClick={() => setSelectedCharacter(char)} style={{ cursor: 'pointer' }}>
                <td>{char.id}</td>
                <td>{char.name}</td>
                <td>{char.status}</td>
                <td>{char.species}</td>
                <td>{char.gender}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div className="pagination">
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>Önceki</button>
        <span>Sayfa {page} / {totalPages}</span>
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Sonraki</button>
      </div>
      {/* Character Detail View */}
      {selectedCharacter && (
        <div className="character-detail">
          <h2>Karakter Detayı</h2>
          <img src={selectedCharacter.image} alt={selectedCharacter.name} width={150} />
          <p><strong>İsim:</strong> {selectedCharacter.name}</p>
          <p><strong>Durum:</strong> {selectedCharacter.status}</p>
          <p><strong>Tür:</strong> {selectedCharacter.species}</p>
          <p><strong>Cinsiyet:</strong> {selectedCharacter.gender}</p>
          <p><strong>Konum:</strong> {selectedCharacter.location?.name}</p>
          <button onClick={() => setSelectedCharacter(null)}>Detayı Kapat</button>
        </div>
      )}
    </div>
  );
}

export default App;
