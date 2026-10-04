fn main() {
    println!("cargo:rerun-if-env-changed=CGROK_VERSION");
}
