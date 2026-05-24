CREATE TABLE enquiry_tags (
    enquiry_id  UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
    tag         VARCHAR(50) NOT NULL,
    PRIMARY KEY (enquiry_id, tag)
);

CREATE TABLE enquiry_replies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id      UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
    admin_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body            TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_enquiry_replies_enquiry_id ON enquiry_replies(enquiry_id);
