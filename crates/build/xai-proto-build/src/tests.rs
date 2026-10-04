use super::*;

#[test]
fn dependency_tracking_supports_native_paths_with_spaces_and_transitive_imports() {
    let temporary = tempfile::tempdir().unwrap();
    let includes = temporary.path().join("proto sources with spaces");
    fs::create_dir_all(includes.join("nested")).unwrap();
    fs::write(
        includes.join("nested/leaf.proto"),
        "syntax = \"proto3\"; package fixture; message Leaf {}",
    )
    .unwrap();
    fs::write(
        includes.join("nested/middle.proto"),
        "syntax = \"proto3\"; package fixture; import \"nested/leaf.proto\"; message Middle { Leaf leaf = 1; }",
    )
    .unwrap();
    fs::write(
        includes.join("entry.proto"),
        "syntax = \"proto3\"; package fixture; import \"nested/middle.proto\"; message Entry { Middle middle = 1; }",
    )
    .unwrap();

    let protoc = find_protoc::find_protoc().unwrap();
    let protoc_include = find_protoc_include_dir(protoc.as_deref());
    XaiProtoBuilder::emit_rerun_if_changed(
        protoc.as_deref(),
        protoc_include.as_deref(),
        [Path::new("entry.proto")],
        [includes.as_path()],
    )
    .unwrap();
}
