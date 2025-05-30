import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { handleRejectedError } from "@/utils/handleRejectedError";
import { supabase } from "@/lib/supaBaseClient";
import { User } from "@supabase/supabase-js";
import { IAuthState } from "@/types/authModel";
import { IUser } from "@/types/userModel";
import { IError } from "@/types/errorModel";

const initialState: IAuthState = {
  user: null,
  profile: null,
  loading: false,
  error: null,
  authStatus: 'idle'
};

export const signUp = createAsyncThunk< { user: User; profile: IUser }, Omit<IUser, 'id'>, { rejectValue: IError }>(
  'auth/signUpUser',
  async ({ name, email, password, role = "user" }, thunkApi) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });

      if (error) {
        return thunkApi.rejectWithValue({ message: error.message, status: error.status });
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: data.user.id, email, role }]);

        if (profileError) {
          return thunkApi.rejectWithValue({ message: profileError.message, status: undefined });
        }

        const { data: profile, error: profileSelectorError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();


       if (profileSelectorError) {
        return thunkApi.rejectWithValue({ message: profileSelectorError.message, status: undefined });
      }

      return { user: data.user, profile };
      }

      return thunkApi.rejectWithValue({ message: "Unexpected error", status: undefined });
    } catch (e: any) {
      return thunkApi.rejectWithValue({ message: e.message || 'Unknown error', status: undefined });
    }
  }
);

export const signIn = createAsyncThunk<
  { user: User, profile: IUser },
  Omit<IUser, 'id'>,
  { rejectValue: IError }
>(
  'auth/signIn',
  async ({ email, password }, thunkApi) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (!data.user || error) {
        return thunkApi.rejectWithValue({ message: error?.message || "Login failed", status: error?.status });
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        return thunkApi.rejectWithValue({ message: profileError.message, status: undefined });
      }

      console.log('profile', profile)

      return { user: data.user, profile };
    } catch (e: any) {
      return thunkApi.rejectWithValue({ message: e.message || "Unknown error", status: undefined });
    }
  }
);


export const refresh = createAsyncThunk<{user: User, profile: IUser}, void, { rejectValue: IError }>(
  'auth/refresh',
  async (_, thunkApi) => {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (!data.user || error) {
        return thunkApi.rejectWithValue({ message: error?.message || "Cannot get user", status: error?.status });
      }
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        return thunkApi.rejectWithValue({ message: profileError.message, status: undefined });
      }

      return { user: data.user, profile };
    } catch (e: any) {
      return thunkApi.rejectWithValue({ message: e.message || "Unknown error", status: undefined });
    }
  }
);

export const logout = createAsyncThunk<void, void, { rejectValue: IError }>(
  'auth/logout',
  async (_, thunkApi) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return thunkApi.rejectWithValue({ message: error.message, status: error.status });
      }
    } catch (e: any) {
      return thunkApi.rejectWithValue({ message: e.message || "Unknown error", status: undefined });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.loading = false;
      state.user = null;
      state.error = null;
    },
    cleanError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action: PayloadAction<{ user: User, profile: IUser }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = handleRejectedError(action);
      })

      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action: PayloadAction<{ user: User, profile: IUser }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = handleRejectedError(action);
      })

      .addCase(refresh.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refresh.fulfilled, (state, action: PayloadAction<{user:User, profile:IUser}>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.error = null;
      })
      .addCase(refresh.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.profile = null;
        state.error = handleRejectedError(action);
      })
      .addCase(logout.pending, (state) => {
        state.authStatus = 'loading';
      })
      .addCase(logout.fulfilled, (state) => {
        state.authStatus = 'succeeded';
        state.user = null;
        state.profile = null;
        state.error = null;
        state.loading = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.authStatus = 'failed';
        state.error = handleRejectedError(action);
        state.loading = false;
      });
  }
});

export const { logoutUser, cleanError } = authSlice.actions;
export default authSlice.reducer;

