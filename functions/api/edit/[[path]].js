import { handle } from "../../../lib/edit-api.mjs"

export const onRequest = ({ request, env }) => handle(request, env)
