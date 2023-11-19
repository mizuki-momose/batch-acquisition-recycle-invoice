import {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  useController,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import AppBar from '@mui/material/AppBar';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import createTheme from '@mui/material/styles/createTheme';
import { BRANCH_OFFICE_NAME, KANA, OFICIAL_STAMP_CARACTER } from './Data';
import { RecycleArraySchema, RecycleSchema, getRecycleCsv, recycleArraySchema } from './RecycleInvoice';

const defaultRecycle: RecycleSchema = {
  carClass: '1',
  vinNumberClass: '1',
  searchClass: '1',
};

const useRecycleForm = () => {
  const {
    control,
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecycleArraySchema>({
    resolver: zodResolver(recycleArraySchema),
    reValidateMode: 'onBlur',
    defaultValues: {
      recycles: [defaultRecycle],
    },
  });

  const { fields, append, remove } = useFieldArray({ name: 'recycles', control });

  const addForm = () => append(defaultRecycle);
  const removeForm = (index: number) => remove(index);
  const resetForm = () => confirm('クリアしてよいですか？') && reset({ recycles: [defaultRecycle] });

  const onSubmit = handleSubmit(async (data: RecycleArraySchema) => {
    if (data.recycles.length === 0) return;

    const csvBlob = getRecycleCsv(data.recycles);
    const csvFile = new File([csvBlob], 'recycle.csv', { type: 'text/csv' });
    const dt = new DataTransfer();
    dt.items.add(csvFile);

    const formId = 'temp-form';
    const windowName = 'new_window';

    window.open('', windowName);
    const form = document.createElement('form');
    form.action = 'http://www1.jars.gr.jp/k/kdl/kdls0010.do';
    form.method = 'post';
    form.enctype = 'multipart/form-data';
    form.style.display = 'none';
    form.target = windowName;
    form.id = formId;
    document.body.appendChild(form);

    const input1 = document.createElement('input');
    const input2 = document.createElement('input');
    input1.type = input2.type = 'hidden';

    input1.name = 'KDLS0010_btnUpload';
    input1.value = '';

    input2.type = 'file';
    input2.name = 'KDLS0010_fleUpload';
    input2.files = dt.files;

    form.appendChild(input1);
    form.appendChild(input2);

    form.submit();
    document.getElementById(formId)?.remove();
  });

  return {
    register,
    control,
    setValue,
    onSubmit,
    errors,
    fields,
    addForm,
    removeForm,
    resetForm,
  };
};

const toHalfWidth = (str: string) =>
  str
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '-')
    .toUpperCase();

const RecycleForm = ({
  register,
  control,
  errors,
  removeForm,
  index,
  setValue,
}: {
  register: UseFormRegister<RecycleArraySchema>;
  control: Control<RecycleArraySchema>;
  errors: FieldErrors<RecycleArraySchema>;
  removeForm: (index: number) => void;
  index: number;
  setValue: UseFormSetValue<RecycleArraySchema>;
}) => {
  const searchClass = useWatch({ control, name: `recycles.${index}.searchClass` });
  const vinNumberClass = useWatch({ control, name: `recycles.${index}.vinNumberClass` });

  const getInputProps = (recycleKey: keyof RecycleSchema) => ({
    ...register(`recycles.${index}.${recycleKey}`),
    onBlur: (e: React.FocusEvent<HTMLInputElement>) =>
      setValue(`recycles.${index}.${recycleKey}`, toHalfWidth(e.target.value)),
    error: !!errors.recycles?.[index]?.[recycleKey],
    helperText: errors.recycles?.[index]?.[recycleKey]?.message,
    variant: 'standard' as const,
    fullWidth: true,
  });

  const MuiAutocomplete = ({
    recycleKey,
    label,
    options,
    width = 'auto',
  }: {
    recycleKey: keyof RecycleSchema;
    label: string;
    options: string[];
    width?: string;
  }) => {
    const {
      field: { ref, value, onBlur, onChange },
      fieldState: { invalid, error },
    } = useController({ control, name: `recycles.${index}.${recycleKey}`, defaultValue: '' });

    return (
      <Autocomplete
        {...{ ref, value, onBlur, options, sx: { width } }}
        onChange={(_, v) => onChange(v)}
        onInputChange={(_, v) => onChange(v)}
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            error={invalid}
            helperText={error?.message}
            variant="standard"
            fullWidth={true}
          />
        )}
      />
    );
  };

  return (
    <Grid container spacing={1}>
      <Grid
        xs={2}
        md={1}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack alignItems="center">
          {index + 1}
          <IconButton aria-label="delete" color="warning" onClick={() => removeForm(index)}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Grid>
      <Grid container xs={10} md={11}>
        <Grid container xs={12}>
          <Grid xs={6} md={2}>
            <TextField {...getInputProps('carClass')} select label="車種" defaultValue="1">
              <MenuItem value="1">登録自動車</MenuItem>
              <MenuItem value="2">軽自動車</MenuItem>
            </TextField>
          </Grid>

          <Grid xs={6} md={2}>
            <TextField {...getInputProps('vinNumberClass')} select label="識別番号" defaultValue="1">
              <MenuItem value="1">車台番号</MenuItem>
              <MenuItem value="2">職権打刻番号</MenuItem>
            </TextField>
          </Grid>

          {vinNumberClass === '1' ? (
            <Grid xs={12} md={5}>
              <TextField {...getInputProps('vinNumber')} label="車台番号" />
            </Grid>
          ) : (
            <>
              <Grid xs={6} md={1}>
                <MuiAutocomplete
                  recycleKey="oficialStampCharacter"
                  label="職権打刻文字"
                  options={OFICIAL_STAMP_CARACTER}
                />
              </Grid>
              <Grid xs={6} md={2}>
                <TextField {...getInputProps('oficialStampNumber')} label="職権打刻番号" />
              </Grid>
            </>
          )}
        </Grid>

        <Grid container xs={12}>
          <Grid xs={6} md={2}>
            <TextField {...getInputProps('searchClass')} select label="検索番号" defaultValue="1">
              <MenuItem value="1">登録番号</MenuItem>
              <MenuItem value="2">リサイクル券番号</MenuItem>
            </TextField>
          </Grid>

          {searchClass === '1' ? (
            <>
              <Grid xs={6} md={2}>
                <MuiAutocomplete recycleKey="branchOfficeName" label="支局名" options={BRANCH_OFFICE_NAME} />
              </Grid>
              <Grid xs={3} md={2}>
                <TextField {...getInputProps('carClassNumber')} label="分類番号" />
              </Grid>
              <Grid xs={2} md={1}>
                <MuiAutocomplete recycleKey="kanaCode" label="かな" options={KANA} />
              </Grid>
              <Grid xs={7} md={3}>
                <TextField {...getInputProps('identificationNumber')} label="一連指定番号" />
              </Grid>
            </>
          ) : (
            <Grid xs={6} md={3}>
              <TextField {...getInputProps('recycleNumber')} label="リサイクル券番号" />
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

function App() {
  const { register, control, onSubmit, errors, fields, addForm, removeForm, resetForm, setValue } = useRecycleForm();

  const theme = createTheme({
    typography: {
      fontSize: 13,
    },
  });

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            リサイクル料インボイス一括作成
          </Typography>
          <Box>
            <Link
              href="https://github.com/mizuki-momose/batch-acquisition-recycle-invoice"
              target="_blank"
              rel="noopener"
              sx={{ color: '#fff' }}
            >
              GitHub
            </Link>
          </Box>
        </Toolbar>
      </AppBar>
      <ThemeProvider theme={theme}>
        <Container>
          <Paper sx={{ padding: 3, marginY: 2 }}>
            <Stack component="form" autoComplete="off" spacing={2}>
              {fields.map((field, index) => (
                <RecycleForm
                  register={register}
                  control={control}
                  errors={errors}
                  removeForm={removeForm}
                  index={index}
                  key={field.id}
                  setValue={setValue}
                />
              ))}
              <Button onClick={() => addForm()} color="success" fullWidth>
                <AddCircleIcon fontSize="large" />
              </Button>
            </Stack>

            <Grid container marginTop={2} alignItems="center" justifyContent="center" spacing={2}>
              <Grid xs={6} md={2}>
                <Button onClick={resetForm} color="error" variant="contained" fullWidth>
                  クリア
                </Button>
              </Grid>
              <Grid xs={6} md={2}>
                <Button onClick={onSubmit} variant="contained" fullWidth>
                  送信
                </Button>
              </Grid>
            </Grid>
          </Paper>
          <Paper>
            <Grid container alignItems="center" justifyContent="center">
              <Grid xs={12} md={8}>
                <Typography>
                  <ul>
                    <li>
                      このサービスは<a href="http://www.jars.gr.jp/">自動車リサイクルシステム</a>
                      とは一切関係のない個人が制作しています
                    </li>
                    <li>このサービスを利用したことで発生した損害等には一切の補償を行いません</li>
                    <li>
                      自動車リサイクルシステムのインボイス発行についての規約・仕様等は
                      <a href="http://www.jars.gr.jp/invoice/">こちら</a>を確認してください
                    </li>
                  </ul>
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </ThemeProvider>
    </>
  );
}

export default App;
