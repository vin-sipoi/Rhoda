import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string
    email: string
    username: string
    provider: string
    confirmed: string
    blocked: string
    createdAt: string
    updatedAt: string
    role: {
        id:string
        name:string
        description: string
        type: string
    }
}

interface AuthState {
    user: User | null
    token: string | null
    isLoading: boolean
    isAuthenticated: boolean

    setUser: (user: User | null) => void
    setToken: (token: string | null) => void
    setLoading: (loading: boolean) => void
    login: (token: string) => Promise<void>
    logout: () => void
    refreshUser: () => Promise<void>

}

export const useAuthStore = create<AuthState>()(
    persist(
    (set,get) => ({
        user:null,
        token: null,
        isLoading: true,
        isAuthenticated: false,

        setUser: (user) => set({user, isAuthenticated: !!user}),

        setToken: (token) => set({token}),
        
        setLoading: (isLoading) => set ({isLoading}),
        
        login: async (authToken: string) => {
            set({isLoading: true})
            try{
                set({token: authToken})
                localStorage.setItem('jwt',authToken)

                const userData = await fetchUserProfile(authToken)
                set({
                    user: userData,
                    isAuthenticated: true,
                    isLoading: false
                })

            }catch (error){
                console.error('Login failed: ',error)
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false
                })
                localStorage.removeItem('jwt')
                throw error
            }
        },
        logout: () => {
            localStorage.removeItem('jwt')
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false
            })
        },

        refreshUser: async() => {
            const { token } = get()
            if(!token) return

            try {
                const userData = await fetchUserProfile(token)
                set({user: userData})
            } catch (error) {
                console.error('Failed to refresh user: ', error)
                get().logout()
            }
        }
    }),

    {
        name: 'auth-storage',
        partialize: (state) => ({
            token: state.token,
            user: state.user
        }),
    }
    
    )
)

const fetchUserProfile = async (authToken: string): Promise<User> => {
    try {
        const response = await fetch('/api/auth/me',{
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type' : 'application/json',
            },
        })

        if(!response.ok){
            const errorText = await response.text()
            console.error("Failed to fetch user profile: ",response.status,errorText);
            throw new Error(`Failed to fetch user profiles:  ${response.status}`)
        }

        const userData = await response.json()
        if(!userData || userData.error){
            console.error(`/api/auth/me returned error or empty ${userData}`)
            throw new Error("Invalid user data received")
        }

        return userData
    } catch (err) {
        console.error("Error in fetchuserprofile: ", err)
        throw err
    }
}