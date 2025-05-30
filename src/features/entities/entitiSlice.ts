import { supabase } from "@/lib/supaBaseClient";
import { IEntitiState, IEntity } from "@/types/entitiModel";
import { IError } from "@/types/errorModel";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { handleRejectedError } from "@/utils/handleRejectedError";
import { jsPDF } from "jspdf";

const initialState: IEntitiState = {
  entities: [],
  entity: null,
  loading: false,
  error: null,
  creatingEntityLoading: false,
};

export const createEntity = createAsyncThunk<
  IEntity,
  { name: string; address: string; capacity: number; image?: File },
  { rejectValue: IError | unknown }
>(
  "entity/create",
  async ({ name, address, capacity, image }, thunkApi) => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      // 1. Создание сущности без фото
      const { data: created, error: insertError } = await supabase
        .from("entities")
        .insert([{ name, address, capacity, owner_user_id: userId }])
        .select()
        .single();

      if (insertError || !created) {
        return thunkApi.rejectWithValue({
          message: insertError?.message || "Ошибка создания сущности",
          status: 500,
        });
      }

      const entityId = created.id;
      let image_url = '';

      // 2. Загрузка фото в Supabase Storage
      if (image) {
        const { error: imageError } = await supabase.storage
          .from("entity-images")
          .upload(`${entityId}.${image.name.split('.').pop()}`, image, {
            contentType: image.type,
          });

        if (imageError) {
          return thunkApi.rejectWithValue({
            message: imageError.message,
            status: 500,
          });
        }

        const { data: imageUrlData } = supabase
          .storage
          .from("entity-images")
          .getPublicUrl(`${entityId}.${image.name.split('.').pop()}`);

        image_url = imageUrlData.publicUrl;
      }

      // 3. Генерация PDF
      const doc = new jsPDF();
      doc.text(`Name: ${name}`, 10, 10);
      doc.text(`Address: ${address}`, 10, 20);
      doc.text(`Capacity: ${capacity}`, 10, 30);

      // Вставка изображения в PDF, если оно есть
      if (image_url) {
        const imageResp = await fetch(image_url);
        const imageBlob = await imageResp.blob();
        const reader = new FileReader();

        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageBlob);
        });

        doc.addImage(base64, 'JPEG', 10, 40, 50, 50); // x, y, width, height
      }

      const pdfArrayBuffer = doc.output("arraybuffer");
      const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });

      // 4. Загрузка PDF
      const { data: uploaded, error: uploadError } = await supabase.storage
        .from("entity-pdfs")
        .upload(`${entityId}.pdf`, pdfBlob, {
          contentType: "application/pdf",
        });

      if (uploadError || !uploaded) {
        return thunkApi.rejectWithValue({
          message: uploadError?.message || "Ошибка загрузки PDF",
          status: 500,
        });
      }

      const { data: publicUrlData } = supabase.storage
        .from("entity-pdfs")
        .getPublicUrl(`${entityId}.pdf`);

      const pdf_path = publicUrlData.publicUrl;

      // 5. Обновление сущности с pdf_path и image_url
      const { error: updateError } = await supabase
        .from("entities")
        .update({ pdf_path, image_url })
        .eq("id", entityId);

      if (updateError) {
        return thunkApi.rejectWithValue({
          message: updateError.message,
          status: 500,
        });
      }

      return {
        ...created,
        pdf_path,
        image_url
      } as IEntity;
    } catch (e) {
      return thunkApi.rejectWithValue(e);
    }
  }
);

export const getEntities = createAsyncThunk<IEntity[], void,  {rejectValue: IError | unknown}>(
    'entity/getEntities',
    async(_, thunkApi) => {
        try {
            const { data, error } = await supabase
            .from('entities')
            .select('*')
            if(error) return thunkApi.rejectWithValue({message: error.message, status: 500});

            return data as IEntity[];
        } catch(e) {
            return thunkApi.rejectWithValue(e)
        }
    }
);

export const getEntity = createAsyncThunk<IEntity, { entityId: string }, { rejectValue: IError | unknown }>(
  'entity/getEntity',
  async ({ entityId }, thunkApi) => {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('id', entityId);
      
      if (error) return thunkApi.rejectWithValue({ message: error.message, status: 500 });

      if (!data || data.length === 0) {
        return thunkApi.rejectWithValue({ message: "Entity not found", status: 404 });
      }

      return data[0] as IEntity;
    } catch (e) {
      return thunkApi.rejectWithValue(e);
    }
  }
);

export const getMyEntities = createAsyncThunk<IEntity[], void,  {rejectValue: IError | unknown}>(
    'entity/getMyEntities',
    async(_, thunkApi) => {
        try {

            const user = await supabase.auth.getUser();
            const userId = user.data.user?.id;
    
            const { data, error } = await supabase
            .from('entities')
            .select('*')
            .eq('owner_user_id', userId);

            if(error) return thunkApi.rejectWithValue({message: error.message, status: 500});

            return data as IEntity[];
        } catch(e) {
            return thunkApi.rejectWithValue(e)
        }
    }
);

// Slice
export const entitiSlice = createSlice({
  name: "entity",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
        .addCase(createEntity.pending, (state) => {
          //state.loading = true;
           state.creatingEntityLoading = true;
            state.error = null;
        }) 
        .addCase(createEntity.fulfilled, (state, action) => {
        state.entities.push(action.payload);
        //state.loading = false;
        state.creatingEntityLoading = false;
        state.error = handleRejectedError(action);
        })
        .addCase(createEntity.rejected, (state, action) => {
        console.error("Ошибка при создании сущности:", action.payload);
        state.creatingEntityLoading = false;
        state.error = handleRejectedError(action)
        })
        .addCase(getEntities.pending, (state) => {
            state.loading = true;
            state.error = null;
        }) 
        .addCase(getEntities.fulfilled, (state, action) => {
        state.entities = action.payload;
        state.loading = false;
        state.error = handleRejectedError(action);
        })
        .addCase(getEntities.rejected, (state, action) => {
        console.error("Ошибка при создании сущности:", action.payload);
        state.error = handleRejectedError(action)
        state.loading = false;
        })
        .addCase(getEntity.pending, (state) => {
            state.loading = true;
            state.error = null;
        }) 
        .addCase(getEntity.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.loading = false;
        state.error = handleRejectedError(action);
        })
        .addCase(getEntity.rejected, (state, action) => {
        console.error("Ошибка при создании сущности:", action.payload);
        state.error = handleRejectedError(action)
        state.loading = false;
        });
        
  },
});

export default entitiSlice.reducer;
