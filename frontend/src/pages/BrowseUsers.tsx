import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Grid, List } from 'lucide-react';
import brain from 'brain';
import { BrowseUsersResponse, SearchUsersResponse } from 'types';
import { UserCard } from 'components/UserCard';
import { SearchFilters } from 'components/SearchFilters';
import { Pagination } from 'components/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list';

const BrowseUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [popularSkills, setPopularSkills] = useState<any[]>([]);
  
  // Browse pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  
  // Filter state
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Load popular skills on mount
  useEffect(() => {
    const loadPopularSkills = async () => {
      try {
        const response = await brain.get_popular_skills();
        const data = await response.json();
        setPopularSkills(data.popular_skills || []);
      } catch (error) {
        console.error('Error loading popular skills:', error);
      }
    };
    loadPopularSkills();
  }, []);

  // Browse users with pagination
  const browseUsers = async (page = 1, skill = skillFilter, location = locationFilter) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        page_size: 12
      };
      
      if (skill) params.skill_filter = skill;
      if (location) params.location_filter = location;
      
      const response = await brain.browse_users(params);
      const data: BrowseUsersResponse = await response.json();
      
      setUsers(data.users);
      setCurrentPage(data.page);
      setTotalPages(data.total_pages);
      setTotalCount(data.total_count);
      setHasNext(data.has_next);
      setHasPrevious(data.has_previous);
    } catch (error) {
      console.error('Error browsing users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Search users in real-time
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      // If no search query, go back to browse mode
      await browseUsers(1);
      return;
    }
    
    setSearchLoading(true);
    try {
      const response = await brain.search_users({ q: query, limit: 20 });
      const data: SearchUsersResponse = await response.json();
      setUsers(data.users);
      // Reset pagination for search results
      setCurrentPage(1);
      setTotalPages(1);
      setTotalCount(data.total_count);
      setHasNext(false);
      setHasPrevious(false);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search input with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Load initial data
  useEffect(() => {
    if (!searchQuery) {
      browseUsers();
    }
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (!searchQuery) {
      browseUsers(page);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filters: { skill?: string; location?: string }) => {
    setSkillFilter(filters.skill || '');
    setLocationFilter(filters.location || '');
    setCurrentPage(1);
    browseUsers(1, filters.skill, filters.location);
  };

  // Handle popular skill click
  const handlePopularSkillClick = (skillName: string) => {
    setSkillFilter(skillName);
    setCurrentPage(1);
    browseUsers(1, skillName, locationFilter);
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Discover Skills</h1>
              <p className="text-slate-600 mt-1">
                Find people to learn from and share your expertise
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-xl"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-xl"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Search */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  Search Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    placeholder="Search by skills, name, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl border-slate-200 focus:border-blue-300"
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-3">
                      <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5 text-blue-600" />
                    Filters
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    {showFilters ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
                <SearchFilters
                  skillFilter={skillFilter}
                  locationFilter={locationFilter}
                  onFilterChange={handleFilterChange}
                  popularSkills={popularSkills}
                />
              </CardContent>
            </Card>

            {/* Popular Skills */}
            {popularSkills.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Popular Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {popularSkills.slice(0, 8).map((skill) => (
                      <Badge
                        key={skill.skill_name}
                        variant="secondary"
                        className="cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors rounded-lg px-3 py-1"
                        onClick={() => handlePopularSkillClick(skill.skill_name)}
                      >
                        {skill.skill_name}
                        <span className="ml-1 text-xs opacity-60">({skill.total_usage})</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {searchQuery ? 'Search Results' : 'Browse Users'}
                </h2>
                <p className="text-slate-600 mt-1">
                  {loading ? 'Loading...' : `${totalCount} users found`}
                </p>
              </div>
              
              {(skillFilter || locationFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSkillFilter('');
                    setLocationFilter('');
                    setCurrentPage(1);
                    browseUsers(1);
                  }}
                  className="rounded-xl"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Active Filters */}
            {(skillFilter || locationFilter) && (
              <div className="mb-6 flex flex-wrap gap-2">
                {skillFilter && (
                  <Badge variant="default" className="rounded-lg px-3 py-1">
                    Skill: {skillFilter}
                  </Badge>
                )}
                {locationFilter && (
                  <Badge variant="default" className="rounded-lg px-3 py-1">
                    Location: {locationFilter}
                  </Badge>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Users Grid/List */}
            {!loading && (
              <>
                {users.length > 0 ? (
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {users.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        viewMode={viewMode}
                        onClick={() => navigate(`/UserProfile?userId=${user.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                      <Users className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        No users found
                      </h3>
                      <p className="text-slate-600 mb-4">
                        {searchQuery 
                          ? 'Try adjusting your search terms or filters'
                          : 'Be the first to create a profile and start skill sharing!'
                        }
                      </p>
                      {!searchQuery && (
                        <Button
                          onClick={() => navigate('/ProfileSetup')}
                          className="rounded-xl"
                        >
                          Create Profile
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Pagination */}
                {!searchQuery && totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      hasNext={hasNext}
                      hasPrevious={hasPrevious}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseUsers;
