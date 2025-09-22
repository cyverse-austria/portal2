import React from 'react'
import { Field } from 'formik'
import { Checkbox, FormControlLabel } from '@mui/material'

const FormikCheckboxWithLabel = ({ name, label, ...props }) => {
    return (
        <Field name={name}>
            {({ field, form }) => (
                <FormControlLabel
                    control={
                        <Checkbox
                            {...field}
                            checked={field.value}
                            onChange={e => {
                                form.setFieldValue(name, e.target.checked)
                            }}
                            {...props}
                        />
                    }
                    label={label}
                />
            )}
        </Field>
    )
}

export default FormikCheckboxWithLabel
