import { Doc } from "../_generated/dataModel";

// Separate what any co-member may see from private account fields
// (verification timestamps, phone, anonymity flags) stored by Convex Auth.

/** Fields shown next to messages, in member lists and in the sidebar. */
export const toPublicUser = (user: Doc<"users">) => ({
    _id: user._id,
    name: user.name,
    image: user.image,
});

/** Fields shown on a co-member's profile panel, which displays the email address. */
export const toProfileUser = (user: Doc<"users">) => ({
    ...toPublicUser(user),
    email: user.email,
});
