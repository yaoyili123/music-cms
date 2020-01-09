<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="歌曲名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getSongs">查询</el-button>
				</el-form-item>
				<el-form-item v-if="albumId != -1">
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="songs" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
      <el-table-column prop="name" label="歌曲名" show-overflow-tooltip sortable>
			</el-table-column>
			<el-table-column prop="albumName" label="专辑名" show-overflow-tooltip sortable>
			</el-table-column>
			<el-table-column prop="author" label="作者" show-overflow-tooltip sortable>
      </el-table-column>
      <el-table-column prop="mUrl" label="音乐地址" show-overflow-tooltip sortable>
      </el-table-column>
			<el-table-column label="操作" width="150">
				<template scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination 
        layout="prev, pager, next" 
        @current-change="handleCurrentChange" 
        :page-size="pageSize" 
        :total="total" 
        style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" @close="closeDialog" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="歌曲名" prop="name">
					<el-input v-model="editForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="歌曲文件" prop="musicUrl">
          <el-upload
            class="avatar-uploader"
            action="http://localhost:8080/upload"
						:before-upload="beforeMusicUpload"
						:on-success="handleAvatarSuccess"
						:on-error="handleAvatarError"
						:on-remove="handleRemove"
						multiple
						:limit="1"
						:file-list="fileList"
						>
						<el-button size="small" type="primary">点击上传</el-button>
  					<div slot="tip" class="el-upload__tip">只能上传mp3或flac文件</div>
          </el-upload>
        </el-form-item>
				<el-form-item label="歌词" prop="lyric">
					<el-input
						type="textarea"
						:rows="6"
						placeholder="请输入内容"
						v-model="editForm.lyric">
					</el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog v-if="albumId != -1" title="新增" @close="closeDialog" v-model="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="歌曲名" prop="name">
					<el-input v-model="addForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="歌曲文件" prop="musicUrl">
          <el-upload
            class="avatar-uploader"
            action="http://localhost:8080/upload"
						:before-upload="beforeMusicUpload"
						:on-success="handleAvatarSuccess"
						:on-error="handleAvatarError"
						multiple
						:limit="1"
						:file-list="fileList"
						>
						<el-button size="small" type="primary">点击上传</el-button>
  					<div slot="tip" class="el-upload__tip">只能上传mp3或flac文件</div>
          </el-upload>
        </el-form-item>
				<el-form-item label="歌词" prop="lyric">
					<el-input
						type="textarea"
						:rows="6"
						placeholder="请输入内容"
						v-model="addForm.lyric">
					</el-input>
				</el-form-item>
				<!-- <el-form-item label="歌词文件" prop="musicUrl">
          <el-upload
            class="avatar-uploader"
						action=""
						:before-upload="beforeLyricUpload"
						:on-error="handleAvatarError"
						multiple
						:limit="1"
						:file-list="lyrics"
						>
						<el-button size="small" type="primary">选择歌词文件</el-button>
  					<div slot="tip" class="el-upload__tip">txt等文本格式</div>
          </el-upload>
        </el-form-item> -->
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
  import Api from '@/api'

	export default {
		data() {
			var matchLyric = (rule, value, callback) => {
				// debugger
				let patt = /^(((\[[0-9][0-9]:[0-9][0-9]\.[0-9][0-9]\])+.*)([\n\r])*)*$/
				if (!patt.test(value)) {
					callback(new Error('歌词格式错误'))
				}
				callback()
			};

			return {
        albumId: -1,
				filters: {
					name: ''
				},
				fileList: [],
				// lyrics: [],
				// lyric: '',
				// editLyric: '',
				musicUrl:'',
        songs: [],
				total: 0,
				page: 1,
				pageSize: 20,
				listLoading: false,
				sels: [],//列表选中列

				editFormVisible: false,
				editLoading: false,
				editFormRules: {
					name: [
						{ required: true, message: '请输入歌曲名', trigger: 'blur' }
					],
					lyric: [
						{ validator: matchLyric, trigger: 'blur' }
					]
				},
				editForm: {},
        
				addFormVisible: false,
				addLoading: false,

				addFormRules: {
					name: [
						{ required: true, message: '请输入歌曲名', trigger: 'blur' }
					],
					lyric: [
						{ validator: matchLyric, trigger: 'blur' }
					]
				},
				addForm: {}
			}
		},
		methods: {
			handleRemove(file, fileList) {
				this.fileList.pop()
        console.log(file, fileList);
			},
			
			handleAvatarSuccess(res, file, fileList) {
        console.log(res)
        console.log(file)
				this.musicUrl = res.data.url
				this.fileList = fileList
			},

			handleAvatarError(err, file) {
        console.log(err)
        this.$message.error(err.msg)
			},
			
			beforeMusicUpload(file) {
        const ok = file.type === 'audio/mp3' || file.type === 'audio/flac'
        if (!ok) {
          this.$message.error('上传的音频格式只能是MP3或flac格式!')
        }
        return ok;
			},

			// beforeLyricUpload(file) {
      //   if (file.type !== 'text/plain') {
			// 		this.$message.error('文本文件只能是txt格式!')
			// 		return false
			// 	}
			// 	let reader = new FileReader()
			// 	reader.onload = function(){
			// 		//查看文件输出内容
			// 		console.log(this.result);
			// 		if (!matchLyric(this.result)) {
			// 			this.$message.error('歌词格式错误!')
			// 		}
					
			// 	}
      //   return false;
			// },
			
			handleCurrentChange(val) {
				this.page = val;
				this.getSongs();
      },
			
			closeDialog() {
				this.musicUrl = ''
				if (this.fileList.length != 0)
					this.fileList.pop()
			},

      getSongs() {
        let params = {
          page: this.page,
          name: this.filters.name,
          size: this.pageSize,
          aid: this.albumId,
        }
        this.listLoading = true;
        Api.getSongs(params).then(function(res) {
          // debugger
          console.log(res)
          this.songs = res.data.data
          this.total = res.data.total
					this.listLoading = false
        }.bind(this)).catch(function(err) {
          console.log(err)
        })
      },
   
      //显示新增界面
			handleAdd: function () {
				this.addFormVisible = true;
				this.addForm = {
          name: '',
					mUrl: '',
					lyric: '',
					albumId: this.albumId,
				};
      },

      //新增
			addSubmit: function () {
				if (this.fileList.length == 0) {
					this.$message({
						message: "没有上传音频文件",
						type: 'error'
					})
					return
				}
					
				this.$refs.addForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.addLoading = true
							this.addForm.mUrl = this.musicUrl
							console.log('addForm.mUrl=' + this.addForm.mUrl + ' musicUrl=' + this.musicUrl)
              let para = Object.assign({}, this.addForm);
							Api.addSong(para).then(function(res) {
                console.log(res)
                if (res.data.code != 0) {
                  this.$message({
                    message: res.data.msg,
                    type: 'error'
									})
									this.addLoading = false;
                  return
                }
								this.addLoading = false;
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['addForm'].resetFields();
								this.addFormVisible = false;
                this.getSongs();
                
							}.bind(this)).catch(function(err) {
                console.log(err)
                this.addLoading = false;
								this.$message({
									message: err.message,
									type: 'error'
                });
                this.listLoading = false;
                
              }.bind(this));
						});
					}
				});
			},
      
			//显示编辑界面
			handleEdit: function (index, row) {
				this.editFormVisible = true
				//FIXME: v-model不会响应引用的改变（浅拷贝），除非是深拷贝成员才会响应，要防止lyric为undefined，反正记住用Object.assign就会响应
				this.editForm = Object.assign({}, row, {lyric: ''});
				this.musicUrl = this.editForm.mUrl
				let strs = this.musicUrl.split('/')
				// this.fileList = [{
					this.fileList = [{
					name: strs[strs.length - 1],
					url: this.musicUrl,
				}]
				const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
				Api.findLyric(this.editForm.id)
					.then(function(res) {
						console.log(res)
						loading.close()
						var tmp = res.data.data.lyric
						if (tmp == null) {
							// this.editLyric = ''
							this.editForm.lyric = ''
							return
						}
						// debugger
						// this.editLyric = tmp
						this.editForm.lyric = tmp
					}.bind(this)).catch(function(err) {
						console.log(err)
						this.$message({
							message: err.message,
							type: 'error'
						});
						loading.close()
					}.bind(this))
			},
			
			//编辑
			editSubmit: function () {
				if (this.fileList.length == 0) {
					this.$message({
						message: "没有上传音频文件",
						type: 'error'
					})
					return
				}

				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true
							// this.editForm.lyric = this.editLyric
							if (this.musicUrl != '')
                this.editForm.mUrl = this.musicUrl
							let para = Object.assign({}, this.editForm)
							Api.updateSong(para).then(function(res) {
                console.log(res)
                if (res.data.code != 0) {
                  this.$message({
                    message: res.data.msg,
                    type: 'error'
									})
									this.editLoading = false;
                  return
                }
								this.editLoading = false;
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['editForm'].resetFields();
								this.editFormVisible = false;
                this.getSongs();
                
							}.bind(this)).catch(function(err) {
                console.log(err)
                this.addLoading = false;
								this.$message({
									message: err.message,
									type: 'error'
                });
                this.listLoading = false;

              }.bind(this))
						});
					}
				});
			},
			
			selsChange: function (sels) {
				this.sels = sels;
      },
      
      //删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					Api.delSong(row.id).then(function(res) {
            console.log(res)
            if (res.data.code != 0) {
              this.$message({
                message: res.data.msg,
                type: 'error'
							})
							this.listLoading = false;
              return
            }
						this.listLoading = false;
						this.$message({
							message: '删除成功',
							type: 'success'
						});
            this.getSongs();
            
					}.bind(this)).catch(function(err) {
            console.log(err)
            this.addLoading = false;
            this.$message({
              message: err.message,
              type: 'error'
            });
            this.listLoading = false;

          }.bind(this))   
				}).catch(() => {
          
				});
      },

			//批量删除
			batchRemove: function () {
        var ids = this.sels.map(item => item.id)
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					Api.delSongs(ids).then(function(res) {
            console.log(res)
            if (res.data.code != 0) {
              this.$message({
                message: res.data.msg,
                type: 'error'
							})
							this.listLoading = false;
              return
            }
						this.listLoading = false;
						this.$message({
							message: '删除成功',
							type: 'success'
						});
            this.getSongs();
            
					}.bind(this)).catch(function(err) {
            console.log(err)
            this.addLoading = false;
            this.$message({
              message: err.message,
              type: 'error'
            });
            this.listLoading = false;

          }.bind(this)) 

				}).catch(() => {

				});
			}
    },
    
		mounted() {
			if (this.$route.params.id !== undefined)
				this.albumId = this.$route.params.id
			this.getSongs();
		}
	}

</script>

<style>

</style>