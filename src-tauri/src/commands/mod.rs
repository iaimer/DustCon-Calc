pub mod projects;
pub mod samples;
pub mod standard_weights;

pub fn empty_to_null(s: String) -> Option<String> {
    if s.is_empty() { None } else { Some(s) }
}