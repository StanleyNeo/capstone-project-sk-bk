import React, { createContext, useState, useContext, useEffect } from 'react';
import ApiService from '../services/api';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [userCourses, setUserCourses] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState({
    id: 'STU001',
    name: 'John Smith',
    email: 'john@example.com'
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        const userEnrollments = await ApiService.getUserEnrollments(currentUser.id);
        console.log('User enrollments:', userEnrollments);
        
        if (userEnrollments && userEnrollments.success) {
          setUserCourses(userEnrollments.data || []);
        }
        
        const coursesData = await ApiService.getCourses();
        console.log('Courses data:', coursesData);
        
        if (coursesData && coursesData.success) {
          setCourses(coursesData.data || []);
        } else {
          setCourses(coursesData || []);
        }
        
        const schoolsData = await ApiService.getSchools();
        console.log('Schools data:', schoolsData);
        
        if (schoolsData && Array.isArray(schoolsData)) {
          setSchools(schoolsData);
        } else if (schoolsData && schoolsData.success) {
          setSchools(schoolsData.data || []);
        } else {
          setSchools([]);
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [currentUser.id]);

  // Add School function
  const addSchool = async (schoolData) => {
    try {
      const result = await ApiService.addSchool(schoolData);
      if (result.success || result._id) {
        const schoolsData = await ApiService.getSchools();
        if (schoolsData && Array.isArray(schoolsData)) {
          setSchools(schoolsData);
        } else if (schoolsData && schoolsData.success) {
          setSchools(schoolsData.data || []);
        }
        return { success: true, data: result };
      }
      return { success: false, error: result.error || 'Failed to add school' };
    } catch (error) {
      console.error('Error adding school:', error);
      return { success: false, error: 'Failed to add school' };
    }
  };

  // Update School function
  const updateSchool = async (id, schoolData) => {
    try {
      const result = await ApiService.updateSchool(id, schoolData);
      if (result.success) {
        const schoolsData = await ApiService.getSchools();
        if (schoolsData && Array.isArray(schoolsData)) {
          setSchools(schoolsData);
        } else if (schoolsData && schoolsData.success) {
          setSchools(schoolsData.data || []);
        }
        return { success: true, data: result };
      }
      return { success: false, error: result.error || 'Failed to update school' };
    } catch (error) {
      console.error('Error updating school:', error);
      return { success: false, error: 'Failed to update school' };
    }
  };

  // Delete School function
  const deleteSchool = async (id) => {
    try {
      const result = await ApiService.deleteSchool(id);
      if (result.success) {
        setSchools(prevSchools => prevSchools.filter(school => school._id !== id));
        return { success: true, message: 'School deleted successfully!' };
      }
      return { success: false, error: result.error || 'Failed to delete school' };
    } catch (error) {
      console.error('Error deleting school:', error);
      return { success: false, error: 'Failed to delete school' };
    }
  };

  // For course enrollment
  const enrollInCourse = async (courseId) => {
    if (ApiService.enrollCourse) {
      const result = await ApiService.enrollCourse(currentUser.id, courseId);
      if (result.success) {
        return { success: true, message: 'Enrolled successfully!' };
      }
      return { success: false, message: result.error };
    }
    
    const course = courses.find(c => c.id === courseId || c._id === courseId);
    if (course) {
      setUserCourses(prev => [...prev, { 
        ...course, 
        enrolledDate: new Date().toISOString(),
        progress: 0 
      }]);
      return { success: true, message: 'Enrolled successfully!' };
    }
    return { success: false, message: 'Course not found' };
  };

  // For AI recommendations
  const getRecommendations = async (interest) => {
    if (ApiService.getAiRecommendations) {
      return await ApiService.getAiRecommendations(interest);
    }
    
    // Mock recommendations for presentation
    return {
      success: true,
      data: {
        recommendations: courses
          .filter(c => c.category?.toLowerCase().includes(interest.toLowerCase()) || 
                      c.name?.toLowerCase().includes(interest.toLowerCase()))
          .slice(0, 3)
      }
    };
  };

  // Refresh data function
  const refreshData = async () => {
    setLoading(true);
    try {
      const [coursesData, schoolsData] = await Promise.all([
        ApiService.getCourses(),
        ApiService.getSchools()
      ]);
      
      if (coursesData && coursesData.success) {
        setCourses(coursesData.data || []);
      }
      
      if (schoolsData && Array.isArray(schoolsData)) {
        setSchools(schoolsData);
      } else if (schoolsData && schoolsData.success) {
        setSchools(schoolsData.data || []);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // IMPORTANT: Only ONE return statement should exist
  return (
    <DataContext.Provider value={{
      courses,
      userCourses,
      schools,
      loading,
      currentUser,
      enrollInCourse,
      addSchool,
      updateSchool,  // Make sure this is included
      deleteSchool,  // Make sure this is included
      getRecommendations,
      refreshData,
      setCurrentUser
    }}>
      {children}
    </DataContext.Provider>
  );
};